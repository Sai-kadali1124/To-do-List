"""
Unit tests for PolicyEngine, Overrides, and Health Scoring
"""

import sys
import shutil
import tempfile
from pathlib import Path

# Add agent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "agent"))

import unittest
from config import ConfigManager
from database import DatabaseManager
from threat_intel import ThreatIntelligence
from process_monitor import ProcessMonitor
from policy_engine import PolicyEngine


class TestPolicyEngine(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.db_path = str(Path(self.temp_dir) / "test.db")
        self.config_path = Path(self.temp_dir) / "config.json"

        self.config = ConfigManager(self.config_path)
        self.db = DatabaseManager(self.db_path)
        self.intel = ThreatIntelligence()
        self.proc_monitor = ProcessMonitor()
        self.policy = PolicyEngine(self.config, self.db, self.intel, self.proc_monitor)

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_allowlist_domain_precedence(self):
        # Adding a flagged domain to allowlist
        domains = self.config.get("allowlist.domains", [])
        domains.append("chase-security-verify.com")
        self.config.set("allowlist.domains", domains)

        verdict = self.policy.evaluate_url("https://chase-security-verify.com/login")
        self.assertEqual(verdict["verdict"], "ALLOW")
        self.assertTrue(verdict["is_allowlisted"])

    def test_strict_mode_escalates_warnings(self):
        self.config.set("sensitivity_mode", "strict")
        # Direct IP evaluation normally produces WARN (P2), in strict mode it should BLOCK
        verdict = self.policy.evaluate_url("http://192.168.1.150/admin")
        self.assertEqual(verdict["verdict"], "BLOCK")

    def test_device_health_all_clear(self):
        health = self.policy.get_device_health()
        self.assertEqual(health["status"], "ALL_CLEAR")
        self.assertEqual(health["badge_color"], "#10b981")

    def test_device_health_attention_on_rat(self):
        self.proc_monitor.add_simulated_process("anydesk")
        health = self.policy.get_device_health()
        self.assertEqual(health["status"], "ATTENTION_NEEDED")
        self.assertEqual(health["badge_color"], "#f59e0b")

    def test_user_override_persists(self):
        # Log a mock threat event
        eid = self.db.log_event("P0", "phishing", "fakebank.com", "Mock block", "BLOCKED")
        self.policy.apply_override(eid, target_domain="fakebank.com", reason="User approved")

        events = self.db.get_events()
        self.assertEqual(events[0]["overridden"], 1)
        self.assertTrue(self.config.is_domain_allowed("fakebank.com"))


if __name__ == "__main__":
    unittest.main()
