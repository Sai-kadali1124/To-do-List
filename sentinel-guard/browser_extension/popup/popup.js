/**
 * SentinelGuard Extension Popup Script
 */

document.addEventListener("DOMContentLoaded", async () => {
  const currentDomainEl = document.getElementById("current-domain");
  const statusTextEl = document.getElementById("site-status-text");
  const agentBadgeEl = document.getElementById("agent-badge");
  const openDashboardBtn = document.getElementById("open-dashboard-btn");

  // Query active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url) {
      try {
        const urlObj = new URL(tabs[0].url);
        currentDomainEl.textContent = urlObj.hostname;
      } catch (e) {
        currentDomainEl.textContent = "Internal Browser Page";
      }
    }
  });

  // Query agent daemon
  chrome.runtime.sendMessage({ type: "GET_AGENT_STATUS" }, (response) => {
    if (response && response.connected) {
      agentBadgeEl.textContent = "Agent Live";
      agentBadgeEl.className = "badge-status badge-connected";
    } else {
      agentBadgeEl.textContent = "Agent Offline";
      agentBadgeEl.className = "badge-status badge-offline";
    }
  });

  // Dashboard opener
  openDashboardBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://127.0.0.1:8765/dashboard" });
  });
});
