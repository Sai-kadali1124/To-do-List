# SentinelGuard — Proactive Endpoint Security & Scam Interceptor

> **Phase 1 MVP Implementation** based on the *Product Definition & Technical Blueprint*.  
> **Architecture:** On-device persistent agent + WebExtension (Manifest V3) + Calm Control Dashboard + Attack Simulation Lab.

---

## 1. System Overview

**SentinelGuard** shifts endpoint defense from reactive detection (antivirus alerts after malware has run) to **pervasive prevention** across apps, downloads, and financial transactions.

It specifically addresses user psychology around **online fraud, drained accounts, and social engineering scams** by implementing:
1. **Scam Context Engine:** Detects and pauses banking sessions whenever a Remote Access Tool (AnyDesk, TeamViewer, RustDesk, etc.) is active.
2. **Transaction Guardrails:** Provides proactive verification friction before high-value funds move to newly added payees.
3. **Pre-Execution Download Inspector:** Intercepts deceptive double-extension files (`.pdf.exe`) and high-entropy packed droppers, isolating them into an encrypted quarantine vault with one-click undo.
4. **Browser Anti-Phishing Guard:** Intercepts typosquatted banking domains, Punycode homographs, and credential-harvesting forms before page render.
5. **Calm "Am I Safe?" Dashboard:** Non-scareware UX with zero fake counters, transparent local privacy guarantees (0 cloud bytes sent), and one-tap override controls.

---

## 2. Codebase Architecture

```
sentinel-guard/
├── agent/                          # Desktop Background Daemon (Zero-dependency Python)
│   ├── config.py                   # Dynamic policy config, sensitivity modes, allowlists
│   ├── database.py                 # SQLite on-device storage for events, quarantine, & overrides
│   ├── threat_intel.py             # Heuristics: typosquatting, homographs, entropy, RAT signatures
│   ├── process_monitor.py          # Real-time process monitor for Remote Access Tools (RATs)
│   ├── download_inspector.py       # Downloads watcher & pre-execution quarantine engine
│   ├── scam_engine.py              # Cross-signal correlation (RAT + Banking + Transaction)
│   ├── policy_engine.py            # Decision engine, sensitivity tiers, health verdict ("Am I Safe?")
│   ├── server.py                   # Local loopback API & dashboard server (127.0.0.1:8765)
│   └── run_agent.py                # Agent CLI launcher
├── browser_extension/              # Browser Guard Extension (Manifest V3 - Chrome/Brave/Edge)
│   ├── manifest.json               # Manifest V3 specification
│   ├── background.js               # Service worker: URL navigation filter & Agent API bridge
│   ├── content_scripts/
│   │   ├── guardrails.js           # Financial transfer interception & payee friction
│   │   ├── form_shield.js          # Credential leak & crypto clipboard hijacking defense
│   │   ├── banner.js               # In-page warning & interstitial modal renderer
│   │   └── banner.css              # Calm, non-scareware UI styling
│   ├── popup/                      # Extension popup status UI
│   └── icons/                      # Extension icons
├── dashboard/                      # "Am I Safe?" User Control Dashboard
│   ├── index.html                  # Responsive dashboard interface
│   ├── css/style.css               # Clean cybersecurity UX (emerald, slate, non-scareware)
│   └── js/app.js                   # Live polling, real-time threat feed, override controls
├── demo/                           # Interactive Demo & Attack Simulation Testbed
│   ├── mock_bank_portal.html       # Realistic banking transfer form to test Guardrails
│   ├── mock_phishing_site.html     # Simulated cloned bank login page
│   └── simulate_scam.py            # End-to-end CLI attack simulator script
├── tests/                          # Automated Verification Suite (100% Pass)
│   ├── test_threat_intel.py        # Typosquatting, entropy, and homograph tests
│   ├── test_scam_engine.py         # RAT + banking correlation tests
│   ├── test_policy_engine.py       # Sensitivity mode and override tests
│   └── test_e2e_simulation.py      # Complete multi-scenario end-to-end simulation
├── start.sh                        # One-command bootstrap launcher
└── README.md                       # Engineering documentation
```

---

## 3. Quickstart & Running the System

### Step 1: Start the Desktop Agent Daemon
Run the one-command launcher:
```bash
./start.sh
```
Or run directly with Python:
```bash
/usr/bin/python3 agent/run_agent.py
```
* The daemon initializes on `http://127.0.0.1:8765`.
* The User Dashboard is available at `http://127.0.0.1:8765/dashboard`.

### Step 2: Load the Browser Extension
1. Open **Google Chrome**, **Brave**, or **Microsoft Edge**.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right toggle).
4. Click **Load unpacked** and select the directory:
   `/Users/kadalisaimanikanta/Desktop/PROJECTS/sentinel-guard/browser_extension`
5. The **SentinelGuard** shield badge will appear in your browser toolbar.

---

## 4. Testing Preventive Defenses in Real-Time

SentinelGuard comes with a built-in **Attack Simulation Lab** in the dashboard (`http://127.0.0.1:8765/dashboard` &rarr; *Attack Simulation Lab* tab):

### Scenario 1: Remote-Access Scam Interception
1. In the Dashboard under *Attack Simulation Lab*, click **"Simulate AnyDesk Launch"**.
2. Notice the **Device Health ("Am I Safe?")** card immediately changes from Emerald (*All Clear*) to Amber (*ATTENTION NEEDED: Remote Access Tool Running*).
3. Open the **Mock Bank Portal** (`http://127.0.0.1:8765/demo/mock_bank_portal.html`).
4. Attempt to send a wire transfer of `$1,250`.
5. **SentinelGuard proactively HALTS the transaction** and displays an unmistakable alert:
   > *"A remote access application (AnyDesk) is running on your machine. If a technician or caller instructed you to make this transfer, THIS IS A CONFIRMED SCAM PATTERN."*
6. Money never leaves your account.

### Scenario 2: Deceptive Invoice Download (.pdf.exe)
1. In the Dashboard under *Attack Simulation Lab*, click **"Trigger Malicious Download"**.
2. SentinelGuard inspects the incoming file (`Invoice_Statement.pdf.exe`).
3. It detects the deceptive double-extension and abnormal payload entropy.
4. **Before the user can execute it**, SentinelGuard moves the file to the **Quarantine Vault** (`quarantine/`) and writes a clear explanatory note in the Downloads folder.
5. In the Dashboard, open the *Quarantine Vault* tab: click **"Restore File"** to observe the one-click undo capability.

### Scenario 3: Cloned Phishing Site Interception
1. Visit `http://127.0.0.1:8765/demo/mock_phishing_site.html`.
2. SentinelGuard evaluates the domain against known blocklists and brand typosquatting algorithms.
3. The page is blocked with a full-screen interstitial before credentials can be entered.
4. Clicking **"I understand the risk, proceed anyway"** registers a persistent override and allows access.

---

## 5. Running Automated Tests

Run the full automated test suite (unit tests + multi-scenario E2E simulation):
```bash
/usr/bin/python3 -m unittest discover tests -v
```

**Results:**
```
test_double_extension_file_quarantined (test_threat_intel.TestThreatIntelligence) ... ok
test_entropy_calculation (test_threat_intel.TestThreatIntelligence) ... ok
test_levenshtein_distance (test_threat_intel.TestThreatIntelligence) ... ok
test_punycode_homograph_blocked (test_threat_intel.TestThreatIntelligence) ... ok
test_remote_tool_with_banking_triggers_p0 (test_scam_engine.TestScamContextEngine) ... ok
test_scenario_1_phishing_prevention (test_e2e_simulation.TestEndToEndSimulation) ... ok
test_scenario_2_download_quarantine_before_execution (test_e2e_simulation.TestEndToEndSimulation) ... ok
test_scenario_3_remote_access_scam_correlation (test_e2e_simulation.TestEndToEndSimulation) ... ok
test_scenario_4_transaction_guardrails (test_e2e_simulation.TestEndToEndSimulation) ... ok
test_scenario_5_user_override_and_restore (test_e2e_simulation.TestEndToEndSimulation) ... ok
----------------------------------------------------------------------
Ran 23 tests in 0.726s

OK
```

---

## 6. Privacy & Ethical Guarantees

As detailed in Section 7 of the Blueprint:
* **Zero Browsing Telemetry:** Full URLs never leave the device. Blocklists and heuristic classifiers operate on local models.
* **On-Device Encrypted Database:** Events, quarantine manifests, and allowlists are stored strictly in local SQLite (`data/sentinel.db`).
* **Non-Scareware UX:** No countdown timers, no artificial vulnerability inflation, and full user autonomy with instant override buttons.
