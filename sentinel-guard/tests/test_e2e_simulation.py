"""
SentinelGuard In-Process End-to-End Simulation & Verification
Directly exercises the full preventive architecture:
1. Anti-Phishing Interception
2. Malicious Download Quarantine
3. Remote Access Tool (RAT) + Banking moment correlation (P0 alert)
4. Financial Transaction Guardrails (new payee & amount threshold)
5. User Override and File Restoration
"""

import sys
import os
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
from download_inspector import DownloadInspector
from scam_engine import ScamContextEngine
from policy_engine import PolicyEngine


class TestEndToEndSimulation(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.downloads_dir = Path(self.temp_dir) / "downloads"
        self.quarantine_dir = Path(self.temp_dir) / "quarantine"
        self.db_path = str(Path(self.temp_dir) / "test.db")
        self.config_path = Path(self.temp_dir) / "config.json"

        self.downloads_dir.mkdir(parents=True, exist_ok=True)
        self.quarantine_dir.mkdir(parents=True, exist_ok=True)

        self.config = ConfigManager(self.config_path)
        self.config.set("paths.downloads_dir", str(self.downloads_dir))
        self.config.set("paths.quarantine_dir", str(self.quarantine_dir))
        self.config.set("paths.db_path", self.db_path)

        self.db = DatabaseManager(self.db_path)
        self.threat_intel = ThreatIntelligence()
        self.proc_monitor = ProcessMonitor()
        self.download_inspector = DownloadInspector(
            watch_dir=str(self.downloads_dir),
            quarantine_dir=str(self.quarantine_dir),
            db=self.db,
            threat_intel=self.threat_intel
        )
        self.scam_engine = ScamContextEngine(self.db, self.config, self.proc_monitor, self.threat_intel)
        self.policy_engine = PolicyEngine(self.config, self.db, self.threat_intel, self.proc_monitor)

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_scenario_1_phishing_prevention(self):
        """Scenario 1: User navigates to fake banking / typosquatted URL."""
        # 1. Fake Chase site
        verdict = self.policy_engine.evaluate_url("https://chase-security-verify.com/login")
        self.assertEqual(verdict["verdict"], "BLOCK")
        self.assertEqual(verdict["tier"], "P0")
        self.assertIn("Phishing", verdict["reason"])

        # 2. Typosquatted site
        verdict2 = self.policy_engine.evaluate_url("https://paypa1-billing.com/update")
        self.assertEqual(verdict2["verdict"], "BLOCK")

        # 3. Legitimate site
        verdict3 = self.policy_engine.evaluate_url("https://chase.com/personal")
        self.assertEqual(verdict3["verdict"], "ALLOW")

    def test_scenario_2_download_quarantine_before_execution(self):
        """Scenario 2: Pre-execution interception of double-extension malware."""
        dangerous_file = self.downloads_dir / "Invoice_Nov2026.pdf.exe"
        with open(dangerous_file, "wb") as f:
            f.write(os.urandom(4096))

        verdict = self.download_inspector.scan_file(dangerous_file)
        self.assertEqual(verdict["verdict"], "QUARANTINE")
        self.assertEqual(verdict["tier"], "P0")

        # Original executable should NO LONGER be in downloads
        self.assertFalse(dangerous_file.exists())

        # Placeholder explanation should be present for user education
        placeholder = self.downloads_dir / "Invoice_Nov2026.pdf.exe.PROTECTED_BY_SENTINEL.txt"
        self.assertTrue(placeholder.exists())
        with open(placeholder, "r") as f:
            content = f.read()
            self.assertIn("SENTINEL GUARD PREVENTIVE INTERCEPTION NOTICE", content)

        # Quarantined file should exist in vault
        quarantined = self.db.get_quarantined_files()
        self.assertEqual(len(quarantined), 1)
        self.assertEqual(quarantined[0]["file_name"], "Invoice_Nov2026.pdf.exe")

    def test_scenario_3_remote_access_scam_correlation(self):
        """Scenario 3: AnyDesk launched while user has banking portal active."""
        # Baseline: clean
        self.assertEqual(self.policy_engine.get_device_health()["status"], "ALL_CLEAR")

        # Attacker induces victim to run AnyDesk
        self.proc_monitor.add_simulated_process("anydesk", pid=77123)

        # User / victim opens banking portal
        self.scam_engine.update_active_domain("chase.com")
        alert = self.scam_engine.evaluate_context(trigger_domain="chase.com")

        self.assertIsNotNone(alert)
        self.assertEqual(alert["threat_tier"], "P0")
        self.assertEqual(alert["action_taken"], "PAUSED_TRANSACTION")
        self.assertIn("AnyDesk", alert["summary"])

        # Health card shifts to ATTENTION_NEEDED
        health = self.policy_engine.get_device_health()
        self.assertEqual(health["status"], "ATTENTION_NEEDED")

    def test_scenario_4_transaction_guardrails(self):
        """Scenario 4: Money transfer interception."""
        # 1. Attacker in AnyDesk session tries to initiate wire transfer of $2,500
        self.proc_monitor.add_simulated_process("teamviewer", pid=99281)
        tx = {
            "domain": "chase.com",
            "amount": 2500.0,
            "payee_name": "Refund Support Operations",
            "is_new_payee": True
        }
        verdict = self.scam_engine.evaluate_transaction_submission(tx)
        self.assertEqual(verdict["verdict"], "BLOCK")
        self.assertEqual(verdict["tier"], "P0")
        self.assertIn("THIS IS A CONFIRMED SCAM PATTERN", verdict["message"])

        # 2. Remote access ended, now legitimate user sends $600 to new payee
        self.proc_monitor.clear_simulated_processes()
        tx_normal = {
            "domain": "chase.com",
            "amount": 600.0,
            "payee_name": "Apartment Landlord",
            "is_new_payee": True
        }
        verdict2 = self.scam_engine.evaluate_transaction_submission(tx_normal)
        self.assertEqual(verdict2["verdict"], "WARN")
        self.assertEqual(verdict2["tier"], "P1")
        self.assertIn("Verify New Payee", verdict2["title"])

    def test_scenario_5_user_override_and_restore(self):
        """Scenario 5: User autonomy, override, and quarantine restore."""
        # Quarantine a double extension test file
        test_file = self.downloads_dir / "statement.pdf.exe"
        with open(test_file, "wb") as f:
            f.write(b"MZ executable header")

        verdict = self.download_inspector.scan_file(test_file)
        self.assertEqual(verdict["verdict"], "QUARANTINE")
        qid = verdict.get("quarantine_id")
        self.assertIsNotNone(qid)

        # User reviews file and chooses to restore it
        self.assertTrue(self.download_inspector.restore_file(qid))
        self.assertTrue(test_file.exists())


if __name__ == "__main__":
    unittest.main()
