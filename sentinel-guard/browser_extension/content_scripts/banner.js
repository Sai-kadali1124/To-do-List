/**
 * SentinelGuard In-Page UI Renderer
 * Renders interstitial blocks, scam warnings, and transaction verification modals.
 */

window.SentinelUI = {
  renderBlockInterstitial(verdict) {
    if (document.getElementById("sentinel-block-interstitial")) return;

    // Prevent page scroll and interaction
    document.documentElement.style.overflow = "hidden";

    const container = document.createElement("div");
    container.id = "sentinel-block-interstitial";
    container.innerHTML = `
      <div class="sentinel-card">
        <div class="sentinel-icon-wrapper">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 class="sentinel-title">Dangerous Site Blocked</h1>
        <p class="sentinel-text">
          SentinelGuard prevented this page from loading because it matches confirmed fraud or credential harvesting patterns.
        </p>
        <div class="sentinel-detail-box">
          <strong>Threat Reason:</strong> ${verdict.reason || "Suspicious domain mimicking financial services"}<br>
          <span style="font-size: 12px; color: #9ca3af; margin-top: 4px; display: inline-block;">Target: ${verdict.domain || window.location.hostname}</span>
        </div>
        <div class="sentinel-button-group">
          <button id="sentinel-go-back-btn" class="sentinel-btn-primary">Return to Safety</button>
          <button id="sentinel-override-btn" class="sentinel-btn-secondary">I understand the risk, proceed anyway</button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(container);

    document.getElementById("sentinel-go-back-btn").addEventListener("click", () => {
      window.history.back();
      setTimeout(() => { window.location.href = "about:blank"; }, 500);
    });

    document.getElementById("sentinel-override-btn").addEventListener("click", () => {
      chrome.runtime.sendMessage({
        type: "OVERRIDE_THREAT",
        data: {
          event_id: verdict.event_id || 0,
          domain: verdict.domain || window.location.hostname,
          reason: "User manual override in browser"
        }
      }, () => {
        container.remove();
        document.documentElement.style.overflow = "";
      });
    });
  },

  renderWarningBanner(verdict) {
    if (document.getElementById("sentinel-warning-banner")) return;

    const banner = document.createElement("div");
    banner.id = "sentinel-warning-banner";
    banner.innerHTML = `
      <div class="sentinel-banner-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span><strong>SentinelGuard Notice:</strong> ${verdict.reason || "Suspicious URL parameters or unverified financial host."}</span>
      </div>
      <button class="sentinel-banner-close" id="sentinel-banner-close-btn">&times;</button>
    `;

    document.body.prepend(banner);
    document.getElementById("sentinel-banner-close-btn").addEventListener("click", () => {
      banner.remove();
    });
  },

  renderGuardrailModal(data, onConfirm, onCancel) {
    if (document.getElementById("sentinel-modal-overlay")) return;

    const isBlock = data.verdict === "BLOCK";
    const overlay = document.createElement("div");
    overlay.id = "sentinel-modal-overlay";
    overlay.innerHTML = `
      <div class="sentinel-card">
        <div class="sentinel-icon-wrapper ${isBlock ? '' : 'guardrail'}">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${isBlock ? '#ef4444' : '#3b82f6'}" stroke-width="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            ${isBlock ? '<line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' : '<polyline points="9 11 12 14 22 4"/>'}
          </svg>
        </div>
        <h1 class="sentinel-title">${data.title || "Financial Transaction Guardrail"}</h1>
        <p class="sentinel-text">${data.message}</p>
        <div class="sentinel-detail-box ${isBlock ? '' : 'guardrail'}">
          <strong>Recommended Action:</strong> ${data.recommended_action || "Verify payee independently."}
        </div>
        <div class="sentinel-button-group">
          <button id="sentinel-guard-cancel-btn" class="sentinel-btn-primary" style="${isBlock ? 'background: #dc2626;' : ''}">
            ${isBlock ? 'Cancel Transaction' : 'Hold / Cancel Transfer'}
          </button>
          <button id="sentinel-guard-proceed-btn" class="sentinel-btn-secondary">
            ${isBlock ? 'Override & Force Send (Dangerous)' : 'Confirm & Proceed'}
          </button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(overlay);

    document.getElementById("sentinel-guard-cancel-btn").addEventListener("click", () => {
      overlay.remove();
      if (onCancel) onCancel();
    });

    document.getElementById("sentinel-guard-proceed-btn").addEventListener("click", () => {
      overlay.remove();
      if (onConfirm) onConfirm();
    });
  }
};

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SHOW_BLOCK_INTERSTITIAL") {
    SentinelUI.renderBlockInterstitial(msg.verdict);
  } else if (msg.type === "SHOW_WARNING_BANNER") {
    SentinelUI.renderWarningBanner(msg.verdict);
  }
});
