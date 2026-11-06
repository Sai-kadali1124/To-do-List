"""
Unit tests for ScamContextEngine and Transaction Guardrails
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
from scam_engine import ScamContextEngine


class TestScamContextEngine(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.db_path = str(Path(self.temp_dir) / "test.db")
        self.config_path = Path(self.temp_dir) / "config.json"

        self.config = ConfigManager(self.config_path)
        self.db = DatabaseManager(self.db_path)
        self.intel = ThreatIntelligence()
        self.proc_monitor = ProcessMonitor()
        self.scam_engine = ScamContextEngine(self.db, self.config, self.proc_monitor, self.intel)

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_remote_tool_with_banking_triggers_p0(self):
        # Simulate AnyDesk running
        self.proc_monitor.add_simulated_process("anydesk", pid=1234)

        # Trigger context evaluation on banking domain
        alert = self.scam_engine.evaluate_context(trigger_domain="chase.com")
        self.assertIsNotNone(alert)
        self.assertEqual(alert["threat_tier"], "P0")
        self.assertEqual(alert["action_taken"], "PAUSED_TRANSACTION")
        self.assertIn("AnyDesk", alert["summary"])

    def test_clean_session_without_remote_tool(self):
        self.proc_monitor.clear_simulated_processes()
        alert = self.scam_engine.evaluate_context(trigger_domain="chase.com")
        self.assertIsNone(alert)

    def test_transaction_halted_during_remote_access(self):
        self.proc_monitor.add_simulated_process("teamviewer", pid=5678)
        tx = {
            "domain": "bankofamerica.com",
            "amount": 1500.0,
            "payee_name": "Technical Support Escrow",
            "is_new_payee": True
        }
        res = self.scam_engine.evaluate_transaction_submission(tx)
        self.assertEqual(res["verdict"], "BLOCK")
        self.assertEqual(res["tier"], "P0")
        self.assertIn("TeamViewer", res["message"])

    def test_new_payee_guardrail_warning(self):
        self.proc_monitor.clear_simulated_processes()
        tx = {
            "domain": "bankofamerica.com",
            "amount": 750.0,
            "payee_name": "New Payee 123",
            "is_new_payee": True
        }
        res = self.scam_engine.evaluate_transaction_submission(tx)
        self.assertEqual(res["verdict"], "WARN")
        self.assertEqual(res["tier"], "P1")
        self.assertIn("Verify New Payee", res["title"])

    def test_small_routine_transaction_cleared(self):
        self.proc_monitor.clear_simulated_processes()
        tx = {
            "domain": "bankofamerica.com",
            "amount": 25.0,
            "payee_name": "Utility Bill",
            "is_new_payee": False
        }
        res = self.scam_engine.evaluate_transaction_submission(tx)
        self.assertEqual(res["verdict"], "ALLOW")
        self.assertEqual(res["tier"], "P3")


if __name__ == "__main__":
    unittest.main()
