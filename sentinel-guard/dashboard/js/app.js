/**
 * SentinelGuard Dashboard Client Application
 * Connects to local Agent daemon on http://127.0.0.1:8765
 */

const API_BASE = "/api";

const state = {
  activeTab: "status-tab",
  status: null,
  events: [],
  quarantine: [],
  config: null
};

// DOM References
const navItems = document.querySelectorAll(".nav-item");
const tabPanes = document.querySelectorAll(".tab-pane");
const pageHeading = document.getElementById("page-heading");
const pageSubheading = document.getElementById("page-subheading");
const refreshBtn = document.getElementById("refresh-btn");

// Hero Status Elements
const heroCard = document.getElementById("status-hero-card");
const heroBadge = document.getElementById("hero-status-tag");
const heroHeadline = document.getElementById("hero-headline");
const heroSummary = document.getElementById("hero-summary");

// Stats
const statThreatsBlocked = document.getElementById("stat-threats-blocked");
const statTxGuarded = document.getElementById("stat-tx-guarded");
const statFilesQuarantined = document.getElementById("stat-files-quarantined");
const statOverrides = document.getElementById("stat-overrides");
const currentModeLabel = document.getElementById("current-mode-label");

// Tables
const eventsTableBody = document.getElementById("events-table-body");
const quarantineTableBody = document.getElementById("quarantine-table-body");

// Config Form
const cfgThresholdInput = document.getElementById("cfg-threshold-input");
const cfgNewPayeeToggle = document.getElementById("cfg-new-payee-toggle");
const cfgRatPauseToggle = document.getElementById("cfg-rat-pause-toggle");
const cfgSensitivitySelect = document.getElementById("cfg-sensitivity-select");
const saveConfigBtn = document.getElementById("save-config-btn");
const configSavedIndicator = document.getElementById("config-saved-indicator");

// Privacy
const privacyLocalSize = document.getElementById("privacy-local-size");

// Simulation Buttons
const simRatStartBtn = document.getElementById("sim-rat-start-btn");
const simRatStopBtn = document.getElementById("sim-rat-stop-btn");
const simRatResult = document.getElementById("sim-rat-result");
const simDownloadBtn = document.getElementById("sim-download-btn");
const simDownloadResult = document.getElementById("sim-download-result");


// Tab Switching
navItems.forEach(item => {
  item.addEventListener("click", () => {
    const targetTab = item.getAttribute("data-tab");
    navItems.forEach(i => i.classList.remove("active"));
    tabPanes.forEach(p => p.classList.remove("active"));

    item.classList.add("active");
    document.getElementById(targetTab).classList.add("active");
    state.activeTab = targetTab;

    // Update Titles
    const titles = {
      "status-tab": ["Device Health", "Continuous on-device protection across apps, transactions, and downloads."],
      "events-tab": ["Threat & Scam Log", "Real-time feed of blocked attacks, phishing intercepts, and guardrails."],
      "guardrails-tab": ["Transaction Guardrails", "Protective friction policies applied before funds leave your accounts."],
      "quarantine-tab": ["Quarantine Vault", "Isolated high-risk downloads. Full undo capability with one click."],
      "privacy-tab": ["Privacy & Data Minimization", "Verify zero browsing telemetry and on-device cryptographic storage."],
      "demo-tab": ["Attack Simulation Lab", "Safely test real-world attack interception in controlled scenarios."]
    };
    if (titles[targetTab]) {
      pageHeading.textContent = titles[targetTab][0];
      pageSubheading.textContent = titles[targetTab][1];
    }
  });
});


// API Fetchers
async function fetchStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (res.ok) {
      state.status = await res.json();
      renderStatus();
    }
  } catch (err) {
    console.error("Agent offline:", err);
  }
}

async function fetchEvents() {
  try {
    const res = await fetch(`${API_BASE}/events?limit=30`);
    if (res.ok) {
      const data = await res.json();
      state.events = data.events || [];
      renderEvents();
    }
  } catch (err) {
    console.error("Error fetching events:", err);
  }
}

async function fetchQuarantine() {
  try {
    const res = await fetch(`${API_BASE}/quarantine`);
    if (res.ok) {
      const data = await res.json();
      state.quarantine = data.quarantine || [];
      renderQuarantine();
    }
  } catch (err) {
    console.error("Error fetching quarantine:", err);
  }
}

async function fetchConfig() {
  try {
    const res = await fetch(`${API_BASE}/config`);
    if (res.ok) {
      state.config = await res.json();
      renderConfig();
    }
  } catch (err) {
    console.error("Error fetching config:", err);
  }
}

async function fetchPrivacy() {
  try {
    const res = await fetch(`${API_BASE}/privacy-audit`);
    if (res.ok) {
      const data = await res.json();
      if (privacyLocalSize && data.storage) {
        privacyLocalSize.textContent = data.storage.local_database_formatted;
      }
    }
  } catch (err) {
    console.error("Error fetching privacy audit:", err);
  }
}


// Renderers
function renderStatus() {
  if (!state.status) return;
  const s = state.status;

  // Hero Card update
  heroCard.className = "status-hero";
  if (s.status_code === "WARNING") {
    heroCard.classList.add("warning");
  } else if (s.status_code === "CRITICAL") {
    heroCard.classList.add("danger");
  }

  heroBadge.textContent = s.status_code;
  heroHeadline.textContent = s.headline;
  heroSummary.textContent = s.summary;

  // Stats
  if (s.stats) {
    statThreatsBlocked.textContent = s.stats.threats_blocked;
    statTxGuarded.textContent = s.stats.transactions_guarded;
    statFilesQuarantined.textContent = s.stats.active_quarantines;
    statOverrides.textContent = s.stats.overridden_events;
  }

  if (s.sensitivity_mode) {
    currentModeLabel.textContent = s.sensitivity_mode.charAt(0).toUpperCase() + s.sensitivity_mode.slice(1);
  }
}

function renderEvents() {
  if (!eventsTableBody) return;
  if (!state.events.length) {
    eventsTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-6" style="text-align:center; color:#94a3b8; padding:24px;">No incidents recorded yet. Your system is calm and secure.</td></tr>`;
    return;
  }

  eventsTableBody.innerHTML = state.events.map(ev => {
    const tierClass = `tier-${ev.threat_tier.toLowerCase()}`;
    const actionClass = `action-${ev.action_taken.toLowerCase()}`;
    const dateStr = new Date(ev.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const isOverridden = ev.overridden === 1;

    return `
      <tr>
        <td><span class="tier-badge ${tierClass}">${ev.threat_tier}</span></td>
        <td style="text-transform: capitalize; font-weight: 500;">${ev.category.replace('_', ' ')}</td>
        <td>
          <div style="font-weight: 600; color: #ffffff;">${escapeHtml(ev.target)}</div>
          <div style="font-size: 12px; color: #94a3b8;">${escapeHtml(ev.summary)}</div>
        </td>
        <td><span class="action-badge ${actionClass}">${ev.action_taken}</span></td>
        <td style="font-family: var(--font-mono); font-size: 12px; color: #94a3b8;">${dateStr}</td>
        <td>
          ${isOverridden 
            ? '<span style="color:#10b981; font-size:12px; font-weight:600;">✓ Overridden</span>' 
            : `<button class="btn-table-action" onclick="overrideEvent(${ev.id}, '${escapeHtml(ev.target)}')">Allow & Unblock</button>`}
        </td>
      </tr>
    `;
  }).join("");
}

function renderQuarantine() {
  if (!quarantineTableBody) return;
  if (!state.quarantine.length) {
    quarantineTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:24px;">Quarantine vault is empty.</td></tr>`;
    return;
  }

  quarantineTableBody.innerHTML = state.quarantine.map(q => {
    const dateStr = new Date(q.quarantine_time * 1000).toLocaleDateString() + " " + new Date(q.quarantine_time * 1000).toLocaleTimeString();
    return `
      <tr>
        <td style="font-weight: 600; color: #ffffff;">${escapeHtml(q.file_name)}</td>
        <td style="color: #f87171; font-size: 12px;">${escapeHtml(q.threat_reason)}</td>
        <td style="font-family: var(--font-mono); font-size: 11px; color: #94a3b8;">${q.sha256.substring(0, 16)}...</td>
        <td style="font-size: 12px; color: #94a3b8;">${dateStr}</td>
        <td>
          ${q.is_restored 
            ? '<span style="color:#10b981; font-size:12px;">Restored</span>' 
            : '<span style="color:#a855f7; font-size:12px; font-weight:600;">Quarantined</span>'}
        </td>
        <td>
          ${q.is_restored ? '' : `<button class="btn-table-action" onclick="restoreQuarantine(${q.id})">Restore File</button>`}
        </td>
      </tr>
    `;
  }).join("");
}

function renderConfig() {
  if (!state.config) return;
  const cfg = state.config;

  if (cfg.transaction_guardrails) {
    cfgThresholdInput.value = cfg.transaction_guardrails.transfer_threshold || 500;
    cfgNewPayeeToggle.checked = !!cfg.transaction_guardrails.require_new_payee_confirmation;
    cfgRatPauseToggle.checked = !!cfg.transaction_guardrails.pause_on_remote_tool_active;
  }
  if (cfg.sensitivity_mode) {
    cfgSensitivitySelect.value = cfg.sensitivity_mode;
  }
}

// Actions
window.overrideEvent = async function (id, target) {
  try {
    const res = await fetch(`${API_BASE}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: id, domain: target, reason: "User manual dashboard override" })
    });
    if (res.ok) {
      await refreshAll();
    }
  } catch (err) {
    alert("Override failed: " + err);
  }
};

window.restoreQuarantine = async function (qid) {
  try {
    const res = await fetch(`${API_BASE}/quarantine/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quarantine_id: qid })
    });
    if (res.ok) {
      alert("File restored successfully to original directory.");
      await refreshAll();
    }
  } catch (err) {
    alert("Restore failed: " + err);
  }
};

// Save Guardrails Settings
saveConfigBtn.addEventListener("click", async () => {
  const payload = {
    "sensitivity_mode": cfgSensitivitySelect.value,
    "transaction_guardrails.transfer_threshold": parseFloat(cfgThresholdInput.value),
    "transaction_guardrails.require_new_payee_confirmation": cfgNewPayeeToggle.checked,
    "transaction_guardrails.pause_on_remote_tool_active": cfgRatPauseToggle.checked
  };

  try {
    const res = await fetch(`${API_BASE}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      configSavedIndicator.style.display = "inline";
      setTimeout(() => { configSavedIndicator.style.display = "none"; }, 2500);
      await refreshAll();
    }
  } catch (err) {
    alert("Failed to save configuration: " + err);
  }
});

// Attack Simulator Handlers
simRatStartBtn.addEventListener("click", async () => {
  simRatResult.textContent = "Triggering AnyDesk simulated process...";
  try {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "remote_access_start", tool: "anydesk" })
    });
    const data = await res.json();
    simRatResult.innerHTML = `<span style="color:#f59e0b; font-weight:600;">ACTIVE: Simulated AnyDesk running (PID: 48291).</span> Check 'Device Health' tab to see proactive Amber warning!`;
    await refreshAll();
  } catch (e) {
    simRatResult.textContent = "Error: " + e;
  }
});

simRatStopBtn.addEventListener("click", async () => {
  try {
    await fetch(`${API_BASE}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "remote_access_stop" })
    });
    simRatResult.textContent = "Simulated remote process cleared. System returned to Safe.";
    await refreshAll();
  } catch (e) {
    simRatResult.textContent = "Error: " + e;
  }
});

simDownloadBtn.addEventListener("click", async () => {
  simDownloadResult.textContent = "Simulating arrival of Invoice_Statement.pdf.exe in Downloads...";
  try {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "malicious_download", file_name: "Invoice_Statement.pdf.exe" })
    });
    const data = await res.json();
    simDownloadResult.innerHTML = `<span style="color:#10b981; font-weight:600;">PREVENTED!</span> File was quarantined to vault before execution. Inspect 'Quarantine Vault' tab!`;
    await refreshAll();
  } catch (e) {
    simDownloadResult.textContent = "Error: " + e;
  }
});

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function refreshAll() {
  await Promise.all([fetchStatus(), fetchEvents(), fetchQuarantine(), fetchConfig(), fetchPrivacy()]);
}

refreshBtn.addEventListener("click", refreshAll);

// Initial Load & Polling Loop
refreshAll();
setInterval(fetchStatus, 2500);
