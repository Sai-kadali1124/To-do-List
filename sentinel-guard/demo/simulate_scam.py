"""
SentinelGuard End-to-End Attack & Prevention Simulation
Executes 5 live attack scenarios against the local agent to verify proactive prevention:
1. Anti-Phishing homograph / typosquatted domain blocking
2. Pre-execution double-extension download scan & quarantine
3. Remote Access Tool (AnyDesk) correlation with banking activity (P0 alert)
4. High-value transaction guardrail friction
5. User one-click override and quarantine restoration
"""

import sys
import time
import json
import urllib.request
import urllib.parse
from pathlib import Path

AGENT_BASE = "http://127.0.0.1:8765/api"


def post_json(endpoint: str, data: dict) -> dict:
    url = f"{AGENT_BASE}/{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def get_json(endpoint: str) -> dict:
    url = f"{AGENT_BASE}/{endpoint}"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode("utf-8"))


def run_simulation():
    print("==================================================================")
    print("    SENTINEL GUARD — LIVE ATTACK & PREVENTION VERIFICATION        ")
    print("==================================================================")

    # Check Agent Connectivity
    try:
        health = get_json("status")
        print(f"[✓] SentinelGuard Agent Daemon Connected! Status: {health.get('status')}")
    except Exception as e:
        print(f"[!] Cannot connect to SentinelGuard Agent on {AGENT_BASE}.")
        print("    Please ensure the agent is running: python3 agent/run_agent.py")
        sys.exit(1)

    print("\n------------------------------------------------------------------")
    print("TEST 1: Anti-Phishing Interception (Typosquatting & Fake Banking)")
    print("------------------------------------------------------------------")
    phishing_tests = [
        "https://chase-security-verify.com/login",
        "https://paypal-account-recovery.top/verify",
        "https://bankofamerica-alert-center.net/account",
        "https://chase.com/personal"  # Legitimate control
    ]

    for url in phishing_tests:
        res = post_json("check-url", {"url": url})
        verdict = res.get("verdict")
        domain = res.get("domain")
        reason = res.get("reason")
        status_symbol = "🛑 BLOCKED" if verdict == "BLOCK" else "✅ ALLOWED"
        print(f"  [{status_symbol}] {domain}")
        print(f"      Tier: {res.get('tier')} | Reason: {reason}")
        if "chase.com" in url:
            assert verdict == "ALLOW", f"Legitimate domain {url} was incorrectly blocked!"
        else:
            assert verdict == "BLOCK", f"Phishing domain {url} failed to be blocked!"

    print("\n------------------------------------------------------------------")
    print("TEST 2: Pre-Execution Malicious Download & Instant Quarantine")
    print("------------------------------------------------------------------")
    dl_res = post_json("simulate", {
        "type": "malicious_download",
        "file_name": "Q4_Financial_Report.pdf.exe"
    })
    verdict = dl_res.get("verdict", {})
    print(f"  [🛡️ QUARANTINED BEFORE EXECUTION] {verdict.get('file_name')}")
    print(f"      Threat Reason: {verdict.get('reason')}")
    print(f"      SHA-256:       {verdict.get('sha256')}")
    assert verdict.get("verdict") == "QUARANTINE"

    # Verify Quarantine Vault
    quarantine_list = get_json("quarantine").get("quarantine", [])
    assert any(q["file_name"] == "Q4_Financial_Report.pdf.exe" for q in quarantine_list)
    print("      Quarantine Vault Record verified in local SQLite database.")

    print("\n------------------------------------------------------------------")
    print("TEST 3: Remote Access Tool + Banking Correlation (P0 Scam Alert)")
    print("------------------------------------------------------------------")
    print("  [*] Simulating scammer launching AnyDesk on target machine...")
    rat_res = post_json("simulate", {"type": "remote_access_start", "tool": "anydesk"})
    time.sleep(0.5)

    print("  [*] Registering active Chase Bank portal session in browser...")
    post_json("register-domain", {"domain": "chase.com"})
    time.sleep(0.5)

    health_under_attack = get_json("status")
    print(f"  [⚠️ HEALTH SHIFT] Device Health status is now: {health_under_attack.get('status')}")
    print(f"      Headline: {health_under_attack.get('headline')}")
    print(f"      Summary:  {health_under_attack.get('summary')}")
    assert health_under_attack.get("status") == "ATTENTION_NEEDED"

    print("\n------------------------------------------------------------------")
    print("TEST 4: Financial Transaction Guardrail Interception")
    print("------------------------------------------------------------------")
    print("  [*] Scammer attempts wire transfer of $2,400 to 'Refund Department'...")
    tx_attempt = {
        "domain": "chase.com",
        "amount": 2400.00,
        "payee_name": "Refund Department Escrow",
        "is_new_payee": True
    }
    tx_verdict = post_json("check-transaction", tx_attempt)
    print(f"  [🛑 TRANSACTION HALTED] Verdict: {tx_verdict.get('verdict')}")
    print(f"      Title:   {tx_verdict.get('title')}")
    print(f"      Message: {tx_verdict.get('message')}")
    assert tx_verdict.get("verdict") == "BLOCK"

    print("\n  [*] Clearing simulated remote access session...")
    post_json("simulate", {"type": "remote_access_stop"})
    time.sleep(0.5)

    print("  [*] Retrying standard transfer of $650 to new payee without RAT...")
    tx_normal = {
        "domain": "chase.com",
        "amount": 650.00,
        "payee_name": "Landlord Rent",
        "is_new_payee": True
    }
    tx_normal_verdict = post_json("check-transaction", tx_normal)
    print(f"  [⚠️ GUARDRAIL PROMPT] Verdict: {tx_normal_verdict.get('verdict')}")
    print(f"      Title: {tx_normal_verdict.get('title')}")
    assert tx_normal_verdict.get("verdict") == "WARN"

    print("\n------------------------------------------------------------------")
    print("TEST 5: User Override & Quarantine Restoration (Autonomy Check)")
    print("------------------------------------------------------------------")
    # Restore the quarantined test file
    qid = verdict.get("quarantine_id")
    if qid:
        restore_res = post_json("quarantine/restore", {"quarantine_id": qid})
        print(f"  [↩️ ONE-CLICK RESTORE] Restored file ID {qid}: {restore_res.get('success')}")
        assert restore_res.get("success") is True

    print("\n==================================================================")
    print("    ALL PREVENTIVE ENDPOINT DEFENSE VERIFICATIONS PASSED!         ")
    print("==================================================================")


if __name__ == "__main__":
    run_simulation()
