"""
Unit tests for ThreatIntelligence and Heuristics Engine
"""

import sys
from pathlib import Path

# Add agent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "agent"))

import unittest
from threat_intel import ThreatIntelligence, calculate_entropy, levenshtein_distance


class TestThreatIntelligence(unittest.TestCase):
    def setUp(self):
        self.intel = ThreatIntelligence()

    def test_levenshtein_distance(self):
        self.assertEqual(levenshtein_distance("chase", "chase"), 0)
        self.assertEqual(levenshtein_distance("chase", "chaze"), 1)
        self.assertEqual(levenshtein_distance("paypal", "paypa1"), 1)

    def test_entropy_calculation(self):
        # Uniform zero bytes should have 0 entropy
        zero_bytes = b"\x00" * 1024
        self.assertEqual(calculate_entropy(zero_bytes), 0.0)

        # High diversity bytes should have high entropy
        import os
        random_bytes = os.urandom(2048)
        entropy = calculate_entropy(random_bytes)
        self.assertGreater(entropy, 7.0)

    def test_known_malicious_domain_blocked(self):
        res = self.intel.evaluate_domain("chase-security-verify.com")
        self.assertEqual(res["verdict"], "BLOCK")
        self.assertEqual(res["tier"], "P0")

    def test_legitimate_bank_allowed(self):
        res = self.intel.evaluate_domain("chase.com")
        self.assertEqual(res["verdict"], "ALLOW")
        self.assertEqual(res["tier"], "P3")

    def test_brand_typosquatting_blocked(self):
        res = self.intel.evaluate_domain("chaze.com")
        self.assertEqual(res["verdict"], "BLOCK")
        self.assertIn("Typosquatting", res["reason"])

    def test_punycode_homograph_blocked(self):
        res = self.intel.evaluate_domain("xn--pple-43d.com")
        self.assertEqual(res["verdict"], "BLOCK")
        self.assertIn("Punycode homograph", res["reason"])

    def test_double_extension_file_quarantined(self):
        res = self.intel.evaluate_file("Payroll_Nov2026.pdf.exe", b"dummy")
        self.assertEqual(res["verdict"], "QUARANTINE")
        self.assertEqual(res["tier"], "P0")

    def test_clean_document_allowed(self):
        res = self.intel.evaluate_file("Quarterly_Report.pdf", b"%PDF-1.4 header")
        self.assertEqual(res["verdict"], "ALLOW")


if __name__ == "__main__":
    unittest.main()
