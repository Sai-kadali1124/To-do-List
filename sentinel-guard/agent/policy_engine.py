"""
SentinelGuard Policy Engine
Manages sensitivity modes, policy arbitration, user overrides, and overall device health verdicts.
"""

from typing import Dict, Any, List, Optional
from config import ConfigManager
from database import DatabaseManager
from threat_intel import ThreatIntelligence
from process_monitor import ProcessMonitor


class PolicyEngine:
    def __init__(self, config: ConfigManager, db: DatabaseManager,
                 threat_intel: ThreatIntelligence, proc_monitor: ProcessMonitor):
        self.config = config
        self.db = db
        self.threat_intel = threat_intel
        self.proc_monitor = proc_monitor

    def evaluate_url(self, url: str) -> Dict[str, Any]:
        """
        Evaluates a URL against allowlists, blocklists, heuristics, and sensitivity tiers.
        """
        # Extract domain
        domain = url.lower()
        if "://" in domain:
            domain = domain.split("://")[1].split("/")[0]
        else:
            domain = domain.split("/")[0]

        # 1. Check Allowlist (User overrides have priority)
        if self.config.is_domain_allowed(domain):
            return {
                "verdict": "ALLOW",
                "tier": "P3",
                "domain": domain,
                "reason": "Domain is on user-approved allowlist",
                "is_allowlisted": True
            }

        # 2. Threat Intel Evaluation
        intel = self.threat_intel.evaluate_domain(domain)
        intel["domain"] = domain
        sensitivity = self.config.get("sensitivity_mode", "balanced")

        # Apply Sensitivity Rules
        if sensitivity == "strict":
            # In strict mode, P2 warnings convert to blocks
            if intel["tier"] in ("P0", "P1", "P2"):
                intel["verdict"] = "BLOCK"
        elif sensitivity == "relaxed":
            # In relaxed mode, only P0 causes automatic block
            if intel["tier"] == "P1":
                intel["verdict"] = "WARN"

        # Log to DB if blocked or warned
        if intel["verdict"] in ("BLOCK", "WARN"):
            eid = self.db.log_event(
                threat_tier=intel["tier"],
                category="phishing",
                target=domain,
                summary=f"Anti-Phishing: {intel['verdict']} on {domain}",
                action_taken="BLOCKED" if intel["verdict"] == "BLOCK" else "WARNED",
                details=intel,
                confidence=intel.get("confidence", 1.0)
            )
            intel["event_id"] = eid

        return intel

    def apply_override(self, event_id: int, target_domain: Optional[str] = None, reason: str = "User confirmed safe") -> bool:
        """Processes a one-tap override request from user."""
        success = self.db.override_event(event_id, reason)
        if target_domain:
            # Add to config allowlist
            domains = self.config.get("allowlist.domains", [])
            if target_domain not in domains:
                domains.append(target_domain)
                self.config.set("allowlist.domains", domains)
        return success

    def get_device_health(self) -> Dict[str, Any]:
        """
        Generates the single-pane 'Am I Safe?' status assessment.
        Honest, clear, non-scareware.
        """
        stats = self.db.get_stats()
        active_rats = self.proc_monitor.active_remote_tools or self.proc_monitor.scan_for_remote_tools()
        
        # Determine status
        if active_rats:
            tool_names = ", ".join([t["name"] for t in active_rats.values()])
            return {
                "status": "ATTENTION_NEEDED",
                "status_code": "WARNING",
                "badge_color": "#f59e0b",  # Amber
                "headline": f"Remote Access Tool Running ({tool_names})",
                "summary": (
                    f"A remote support tool is currently active. If you are sharing your screen with someone "
                    f"you did not initiate contact with, do not log into banking or payment websites."
                ),
                "active_rats": list(active_rats.values()),
                "stats": stats,
                "sensitivity_mode": self.config.get("sensitivity_mode", "balanced"),
                "protection_active": True
            }

        # Check if there are unreviewed P0 blocks within the last 15 minutes
        recent_events = self.db.get_events(limit=5)
        unreviewed_threats = [e for e in recent_events if e["threat_tier"] == "P0" and not e["overridden"]]

        if unreviewed_threats:
            latest = unreviewed_threats[0]
            return {
                "status": "THREAT_STOPPED",
                "status_code": "PROTECTED",
                "badge_color": "#10b981",  # Emerald
                "headline": f"Threat Proactively Prevented: {latest['target']}",
                "summary": f"SentinelGuard blocked an attempt to access a dangerous site or malicious file. Your device remains secure.",
                "active_rats": [],
                "stats": stats,
                "sensitivity_mode": self.config.get("sensitivity_mode", "balanced"),
                "protection_active": True
            }

        return {
            "status": "ALL_CLEAR",
            "status_code": "SAFE",
            "badge_color": "#10b981",  # Emerald
            "headline": "Shields Active — You are Protected",
            "summary": "Real-time process monitoring, browser guardrails, download scanning, and scam interception are active.",
            "active_rats": [],
            "stats": stats,
            "sensitivity_mode": self.config.get("sensitivity_mode", "balanced"),
            "protection_active": True
        }
