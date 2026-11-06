/**
 * SentinelGuard Background Service Worker (Manifest V3)
 * Orchestrates real-time URL reputation checks and communicates with the
 * local SentinelGuard desktop agent (http://127.0.0.1:8765).
 */

const AGENT_API_BASE = "http://127.0.0.1:8765/api";
const cache = new Map(); // Domain -> Verdict cache (TTL 5 mins)

// Fallback local rules if agent daemon is temporarily offline
const FALLBACK_PHISHING_DOMAINS = [
  "chase-security-verify.com",
  "paypal-account-recovery.top",
  "bankofamerica-alert-center.net",
  "wellsfargo-transfer-confirm.info",
  "security-update-refund.org",
  "quick-support-download.xyz",
  "secure-crypto-drainer.cc"
];

async function checkUrlWithAgent(url) {
  try {
    const domain = new URL(url).hostname;
    
    // Check local cache
    if (cache.has(domain)) {
      const entry = cache.get(domain);
      if (Date.now() - entry.time < 300000) {
        return entry.data;
      }
    }

    const response = await fetch(`${AGENT_API_BASE}/check-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (response.ok) {
      const data = await response.json();
      cache.set(domain, { data, time: Date.now() });
      return data;
    }
  } catch (err) {
    // Offline / fallback mode
    const domain = new URL(url).hostname.toLowerCase();
    for (const bad of FALLBACK_PHISHING_DOMAINS) {
      if (domain === bad || domain.endsWith("." + bad)) {
        return {
          verdict: "BLOCK",
          tier: "P0",
          domain,
          reason: "Confirmed phishing site targeting financial credentials.",
          confidence: 1.0
        };
      }
    }
  }

  return { verdict: "ALLOW", tier: "P3", reason: "Standard site" };
}

async function registerDomainWithAgent(domain) {
  try {
    await fetch(`${AGENT_API_BASE}/register-domain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain })
    });
  } catch (e) {
    // Agent daemon might be starting up
  }
}

// Intercept navigation
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only main frame
  const url = details.url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return;

  const domain = new URL(url).hostname;
  registerDomainWithAgent(domain);

  const verdict = await checkUrlWithAgent(url);
  if (verdict.verdict === "BLOCK") {
    // Notify content script to block page rendering immediately
    chrome.tabs.sendMessage(details.tabId, {
      type: "SHOW_BLOCK_INTERSTITIAL",
      verdict
    }).catch(() => {});
  } else if (verdict.verdict === "WARN") {
    chrome.tabs.sendMessage(details.tabId, {
      type: "SHOW_WARNING_BANNER",
      verdict
    }).catch(() => {});
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHECK_TRANSACTION") {
    fetch(`${AGENT_API_BASE}/check-transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.data)
    })
      .then(res => res.json())
      .then(data => sendResponse(data))
      .catch(err => {
        // Fallback transaction check
        sendResponse({
          verdict: "ALLOW",
          tier: "P3",
          message: "Agent connection offline; local fallback applied."
        });
      });
    return true; // Keep message channel open for async response
  }

  if (message.type === "OVERRIDE_THREAT") {
    fetch(`${AGENT_API_BASE}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.data)
    })
      .then(res => res.json())
      .then(data => {
        // Invalidate cache for this domain
        if (message.data.domain) {
          cache.delete(message.data.domain);
        }
        sendResponse(data);
      })
      .catch(err => sendResponse({ success: false, error: err.toString() }));
    return true;
  }

  if (message.type === "GET_AGENT_STATUS") {
    fetch(`${AGENT_API_BASE}/status`)
      .then(res => res.json())
      .then(data => sendResponse({ connected: true, data }))
      .catch(err => sendResponse({ connected: false, error: "SentinelGuard Agent is not running" }));
    return true;
  }
});
