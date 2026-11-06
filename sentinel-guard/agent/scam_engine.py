"""
SentinelGuard Scam Context Engine
Correlates concurrent signals across process state, active browser sessions,
and financial transaction actions to detect active social-engineering scams in real time.
"""

import time
from typing import Dict, Any, List, Optional, Callable
from database import DatabaseManager
from config import ConfigManager
from process_monitor import ProcessMonitor
from threat_intel import ThreatIntelligence, PROTECTED_FINANCIAL_BRANDS


class ScamContextEngine:
    def __init__(self, db: DatabaseManager, config: ConfigManager,
                 proc_monitor: ProcessMonitor, threat_intel: ThreatIntelligence,
                 broadcast_callback: Optional[Callable[[Dict[str, Any]], None]] = None):
        self.db = db
        self.config = config
        self.proc_monitor = proc_monitor
        self.threat_intel = threat_intel
        self.broadcast_callback = broadcast_callback
        self.active_browser_domains: Dict[str, float] = {}  # domain -> timestamp

    def update_active_domain(self, domain: str):
        """Called by browser extension to register domains currently open in tabs."""
        clean_domain = domain.lower().split(":")[0].strip()
        self.active_browser_domains[clean_domain] = time.time()
        
        # Check if navigating to a banking domain while a RAT is active
        self.evaluate_context(trigger_domain=clean_domain)

    def remove_active_domain(self, domain: str):
        clean_domain = domain.lower().split(":")[0].strip()
        if clean_domain in self.active_browser_domains:
            del self.active_browser_domains[clean_domain]

    def is_financial_domain(self, domain: str) -> bool:
        """Determines if a domain is a known banking, credit union, or financial portal."""
        domain_lower = domain.lower()
        for brand in PROTECTED_FINANCIAL_BRANDS:
            for legit_domain in brand["domains"]:
                if domain_lower == legit_domain or domain_lower.endswith("." + legit_domain):
                    return True
        # Common banking keywords in clean domains
        for kw in ["bank", "creditunion", "invest", "crypto", "fidelity", "schwab", "vanguard"]:
            if kw in domain_lower:
                return True
        return False

    def evaluate_context(self, trigger_domain: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Cross-correlates running remote access tools with active banking domains.
        """
        remote_tools = self.proc_monitor.active_remote_tools
        if not remote_tools:
            # Also do a quick direct check
            remote_tools = self.proc_monitor.scan_for_remote_tools()

        if not remote_tools:
            return None

        # Check if any active browser domain is financial
        checked_domains = [trigger_domain] if trigger_domain else list(self.active_browser_domains.keys())
        for dom in checked_domains:
            if not dom:
                continue
            if self.is_financial_domain(dom):
                tool_names = ", ".join([t["name"] for t in remote_tools.values()])
                alert = {
                    "threat_tier": "P0",
                    "category": "remote_access_scam",
                    "target": dom,
                    "summary": f"High Risk: Remote access tool ({tool_names}) active during financial session ({dom})",
                    "details": {
                        "active_tools": list(remote_tools.values()),
                        "financial_domain": dom,
                        "recommended_action": "Sever remote connection immediately. Scammers frequently use remote tools to manipulate banking balances or initiate unauthorized transfers."
                    },
                    "action_taken": "PAUSED_TRANSACTION"
                }

                # Log event in DB
                eid = self.db.log_event(
                    threat_tier=alert["threat_tier"],
                    category=alert["category"],
                    target=alert["target"],
                    summary=alert["summary"],
                    action_taken=alert["action_taken"],
                    details=alert["details"],
                    confidence=0.99
                )
                alert["id"] = eid

                if self.broadcast_callback:
                    self.broadcast_callback({"event": "SCAM_PATTERN_DETECTED", "alert": alert})

                return alert

        return None

    def evaluate_transaction_submission(self, tx_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a financial transaction attempt submitted from browser extension.
        tx_data: {
            "domain": "chase.com",
            "amount": 1200.00,
            "payee_name": "John Doe",
            "is_new_payee": True,
            "currency": "USD"
        }
        """
        domain = tx_data.get("domain", "")
        amount = float(tx_data.get("amount", 0.0))
        is_new_payee = bool(tx_data.get("is_new_payee", False))
        payee_name = tx_data.get("payee_name", "Unknown Payee")

        remote_tools = self.proc_monitor.active_remote_tools or self.proc_monitor.scan_for_remote_tools()
        threshold = float(self.config.get("transaction_guardrails.transfer_threshold", 500.0))
        require_new_payee_check = bool(self.config.get("transaction_guardrails.require_new_payee_confirmation", True))

        # Scenario 1: Remote tool active during transfer attempt (CRITICAL P0)
        if remote_tools:
            tool_names = ", ".join([t["name"] for t in remote_tools.values()])
            eid = self.db.log_event(
                threat_tier="P0",
                category="transaction",
                target=domain,
                summary=f"Transfer blocked: Active remote connection ({tool_names}) detected while transferring ${amount:.2f}",
                action_taken="BLOCKED",
                details={
                    "amount": amount,
                    "payee": payee_name,
                    "active_tools": list(remote_tools.values()),
                    "is_new_payee": is_new_payee
                },
                confidence=1.0
            )
            return {
                "verdict": "BLOCK",
                "tier": "P0",
                "event_id": eid,
                "title": "Transfer Paused — Remote Control Detected",
                "message": (
                    f"A remote access application ({tool_names}) is running on your machine. "
                    f"If a technician, caller, or support agent instructed you to make this ${amount:.2f} transfer, "
                    f"THIS IS A CONFIRMED SCAM PATTERN. Legitimate support agents never ask you to transfer funds."
                ),
                "can_override": True,
                "recommended_action": "Disconnect the remote session immediately."
            }

        # Scenario 2: Large transfer to new payee (HIGH P1)
        if is_new_payee and amount >= threshold and require_new_payee_check:
            eid = self.db.log_event(
                threat_tier="P1",
                category="transaction",
                target=domain,
                summary=f"Transaction Guardrail: Review required for ${amount:.2f} transfer to new payee '{payee_name}'",
                action_taken="WARNED",
                details={"amount": amount, "payee": payee_name, "threshold": threshold},
                confidence=0.90
            )
            return {
                "verdict": "WARN",
                "tier": "P1",
                "event_id": eid,
                "title": "Transaction Guardrail: Verify New Payee",
                "message": (
                    f"You are transferring ${amount:.2f} to a newly added payee ('{payee_name}'). "
                    f"Did you verify their account details independently? "
                    f"Bank fraud callers often instruct victims to wire money to 'safe accounts' — banks never ask for this."
                ),
                "can_override": True,
                "recommended_action": "Confirm payee identity via a known, trusted phone number."
            }

        # Scenario 3: Standard transfer above threshold
        if amount >= threshold:
            eid = self.db.log_event(
                threat_tier="P2",
                category="transaction",
                target=domain,
                summary=f"High-value transfer alert: ${amount:.2f} to '{payee_name}'",
                action_taken="WARNED",
                details={"amount": amount, "payee": payee_name},
                confidence=0.85
            )
            return {
                "verdict": "WARN",
                "tier": "P2",
                "event_id": eid,
                "title": "High-Value Transfer Confirmation",
                "message": f"This transfer of ${amount:.2f} exceeds your ${threshold:.2f} notification threshold.",
                "can_override": True,
                "recommended_action": "Proceed if this transfer was planned by you."
            }

        return {
            "verdict": "ALLOW",
            "tier": "P3",
            "title": "Transaction Cleared",
            "message": "Transaction cleared standard guardrail checks.",
            "can_override": True
        }
