"""
SentinelGuard Threat Intelligence & Heuristics Engine
Contains seeded reputation lists, typosquatting analyzers, remote access tool signatures,
and file entropy classifiers.
"""

import re
import math
from typing import Dict, Any, Optional, Tuple, List

# Signatures for known Remote Access & Screen Sharing tools frequently abused in tech support scams
KNOWN_REMOTE_ACCESS_TOOLS = {
    "anydesk": {
        "name": "AnyDesk",
        "binaries": ["anydesk", "anydesk.exe"],
        "ports": [6568, 7070],
        "risk_level": "HIGH_IF_UNEXPECTED",
        "description": "Legitimate remote desktop tool frequently weaponized in refund and tech-support scams."
    },
    "teamviewer": {
        "name": "TeamViewer",
        "binaries": ["teamviewer", "teamviewer_service", "teamviewerd"],
        "ports": [5938],
        "risk_level": "HIGH_IF_UNEXPECTED",
        "description": "Remote desktop tool often installed under scammer coercion."
    },
    "rustdesk": {
        "name": "RustDesk",
        "binaries": ["rustdesk"],
        "ports": [21115, 21116],
        "risk_level": "HIGH_IF_UNEXPECTED",
        "description": "Open source remote desktop client used in recent scam campaigns."
    },
    "screenconnect": {
        "name": "ConnectWise ScreenConnect",
        "binaries": ["screenconnect", "screenconnect.clientservice"],
        "ports": [8040, 8041],
        "risk_level": "HIGH_IF_UNEXPECTED",
        "description": "Enterprise support tool abused in financial takeover scams."
    },
    "ultraviewer": {
        "name": "UltraViewer",
        "binaries": ["ultraviewer", "ultraviewer_service"],
        "ports": [80],
        "risk_level": "HIGH_IF_UNEXPECTED",
        "description": "Remote desktop software popular among fraudulent call centers."
    },
    "quickassist": {
        "name": "Windows Quick Assist",
        "binaries": ["quickassist.exe", "ms-quick-assist"],
        "ports": [443],
        "risk_level": "HIGH_IF_UNEXPECTED",
        "description": "Native Windows remote assistance tool abused in voice phishing (vishing)."
    },
    "logmein": {
        "name": "LogMeIn",
        "binaries": ["logmein", "logmeinsystray"],
        "ports": [443],
        "risk_level": "HIGH_IF_UNEXPECTED",
        "description": "Remote control tool used in remote-takeover fraud."
    }
}

# Major protected banking and payment targets vulnerable to credential harvesting & cloned domains
PROTECTED_FINANCIAL_BRANDS = [
    {"name": "Chase Bank", "domains": ["chase.com", "jpmorgan.com"], "keywords": ["chase", "jpmorgan"]},
    {"name": "Bank of America", "domains": ["bankofamerica.com", "bofa.com"], "keywords": ["bankofamerica", "bofa"]},
    {"name": "Wells Fargo", "domains": ["wellsfargo.com"], "keywords": ["wellsfargo"]},
    {"name": "PayPal", "domains": ["paypal.com"], "keywords": ["paypal"]},
    {"name": "Citibank", "domains": ["citi.com", "citibank.com"], "keywords": ["citibank", "citi"]},
    {"name": "Capital One", "domains": ["capitalone.com"], "keywords": ["capitalone"]},
    {"name": "Coinbase", "domains": ["coinbase.com"], "keywords": ["coinbase"]},
    {"name": "Venmo", "domains": ["venmo.com"], "keywords": ["venmo"]},
    {"name": "Fidelity", "domains": ["fidelity.com"], "keywords": ["fidelity"]},
    {"name": "Charles Schwab", "domains": ["schwab.com"], "keywords": ["schwab"]}
]

# Known malicious / phishing domain blocklist (seeded mock feeds + real threat samples)
KNOWN_MALICIOUS_DOMAINS = {
    "chase-security-verify.com": "Phishing credential harvester imitating Chase Bank",
    "paypal-account-recovery.top": "Phishing credential harvester targeting PayPal users",
    "bankofamerica-alert-center.net": "Fake security alert site targeting Bank of America",
    "wellsfargo-transfer-confirm.info": "Fraudulent payment confirmation portal",
    "security-update-refund.org": "Tech support scam refund portal",
    "quick-support-download.xyz": "Malware dropper distributing trojanized AnyDesk installer",
    "secure-crypto-drainer.cc": "Web3 wallet drainer domain",
    "apple-id-verify-locked.com": "Credential harvesting portal targeting Apple IDs",
    "microsoft-defender-alert09.site": "Fake blue screen / browser lock scam"
}

# High-risk executable extensions
DANGEROUS_EXTENSIONS = {
    ".exe": "Windows Executable binary",
    ".scr": "Screen Saver / Executable disguise",
    ".vbs": "VBScript malware dropper",
    ".bat": "Batch command script",
    ".cmd": "Command interpreter script",
    ".ps1": "PowerShell automation script",
    ".js": "JavaScript script wrapper",
    ".jar": "Java executable archive",
    ".pkg": "macOS installer package",
    ".dmg": "macOS disk image (requires notarization inspection)",
    ".app": "macOS application bundle"
}


def calculate_entropy(data: bytes) -> float:
    """Calculates Shannon entropy of byte data (0.0 to 8.0). High entropy (> 7.2) indicates packing/encryption."""
    if not data:
        return 0.0
    entropy = 0.0
    length = len(data)
    byte_counts = {}
    for b in data:
        byte_counts[b] = byte_counts.get(b, 0) + 1
    for count in byte_counts.values():
        p = count / length
        entropy -= p * math.log2(p)
    return entropy


def levenshtein_distance(s1: str, s2: str) -> int:
    """Computes Levenshtein distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    prev = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        curr = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev[j + 1] + 1
            deletions = curr[j] + 1
            substitutions = prev[j] + (c1 != c2)
            curr.append(min(insertions, deletions, substitutions))
        prev = curr
    return prev[-1]


def normalize_leetspeak(text: str) -> str:
    """Normalizes common leet-speak character substitutions (e.g. paypa1 -> paypal, w3llsfarg0 -> wellsfargo)."""
    table = str.maketrans({
        "1": "l",
        "0": "o",
        "3": "e",
        "4": "a",
        "@": "a",
        "5": "s",
        "7": "t",
        "8": "b"
    })
    return text.translate(table)


class ThreatIntelligence:
    def __init__(self):
        self.malicious_domains = dict(KNOWN_MALICIOUS_DOMAINS)
        self.remote_tools = dict(KNOWN_REMOTE_ACCESS_TOOLS)
        self.protected_brands = list(PROTECTED_FINANCIAL_BRANDS)

    def evaluate_domain(self, domain: str) -> Dict[str, Any]:
        """
        Evaluates a domain against known blocklists and anti-phishing heuristics:
        - Exact match with known malicious domains
        - Punycode / IDN homograph attacks (e.g. xn--)
        - Typosquatting of protected financial brands
        - Suspicious TLD patterns with brand names
        """
        domain_clean = domain.lower().strip()
        # Remove port if present
        if ":" in domain_clean:
            domain_clean = domain_clean.split(":")[0]

        # 1. Exact match blocklist
        if domain_clean in self.malicious_domains:
            return {
                "verdict": "BLOCK",
                "tier": "P0",
                "reason": self.malicious_domains[domain_clean],
                "confidence": 1.0,
                "heuristic": "known_malicious_domain"
            }

        # 2. Punycode check (homograph attack)
        if "xn--" in domain_clean:
            return {
                "verdict": "BLOCK",
                "tier": "P1",
                "reason": f"Punycode homograph detected: {domain_clean}. Likely visual impersonation of legitimate brand.",
                "confidence": 0.95,
                "heuristic": "idn_homograph"
            }

        # 3. Financial Brand Impersonation / Typosquatting / Leetspeak
        domain_normalized = normalize_leetspeak(domain_clean)
        for brand in self.protected_brands:
            brand_legit_domains = [d.lower() for d in brand["domains"]]
            # If it is the legitimate domain, skip
            is_legit = False
            for legit in brand_legit_domains:
                if domain_clean == legit or domain_clean.endswith("." + legit):
                    is_legit = True
                    break
            if is_legit:
                continue

            # Check if domain contains brand keywords (raw or normalized)
            for kw in brand["keywords"]:
                if kw in domain_clean or kw in domain_normalized:
                    # Brand keyword appears in unauthorized domain
                    scam_tokens = ["login", "verify", "secure", "alert", "update", "service", "banking", "account", "support", "billing"]
                    matched_tokens = [tok for tok in scam_tokens if tok in domain_clean or tok in domain_normalized]
                    if matched_tokens or kw in domain_normalized and kw not in domain_clean:
                        return {
                            "verdict": "BLOCK",
                            "tier": "P0",
                            "reason": f"Phishing alert: Unauthorized domain '{domain_clean}' mimics {brand['name']} with keywords/leetspeak {matched_tokens or kw}.",
                            "confidence": 0.98,
                            "heuristic": "brand_keyword_impersonation"
                        }

            # Check Levenshtein distance against primary domain
            primary_name = brand["domains"][0].split(".")[0]
            domain_primary_part = domain_clean.split(".")[0]
            dist = levenshtein_distance(domain_primary_part, primary_name)
            if 0 < dist <= 2 and len(primary_name) >= 4:
                return {
                    "verdict": "BLOCK",
                    "tier": "P1",
                    "reason": f"Typosquatting detected: '{domain_clean}' is suspiciously similar to legitimate brand domain '{brand['domains'][0]}'.",
                    "confidence": 0.92,
                    "heuristic": "typosquatting_distance"
                }

        # 4. IP-as-hostname check
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain_clean):
            return {
                "verdict": "WARN",
                "tier": "P2",
                "reason": f"Direct IP address used as hostname ({domain_clean}). Legitimate financial portals rarely use bare IPs.",
                "confidence": 0.85,
                "heuristic": "bare_ip_navigation"
            }

        return {
            "verdict": "ALLOW",
            "tier": "P3",
            "reason": "Domain cleared by reputation and heuristic filters",
            "confidence": 0.99,
            "heuristic": "clean"
        }

    def evaluate_file(self, file_name: str, file_bytes: bytes) -> Dict[str, Any]:
        """
        Analyzes a downloaded file for pre-execution risk indicators:
        - Double extensions (e.g., statement.pdf.exe)
        - High-risk script/executable extensions
        - High Shannon entropy (packing/cryptor detection)
        """
        file_name_lower = file_name.lower()
        parts = file_name_lower.split(".")

        # Double extension check
        if len(parts) > 2:
            second_last = "." + parts[-2]
            last = "." + parts[-1]
            doc_exts = [".pdf", ".docx", ".xlsx", ".txt", ".jpg", ".png"]
            if second_last in doc_exts and last in DANGEROUS_EXTENSIONS:
                return {
                    "verdict": "QUARANTINE",
                    "tier": "P0",
                    "reason": f"Deceptive double extension detected: '{file_name}'. Disguises executable as document.",
                    "confidence": 1.0,
                    "heuristic": "double_extension_deception"
                }

        # Check dangerous extension
        ext = "." + parts[-1] if len(parts) > 1 else ""
        if ext in DANGEROUS_EXTENSIONS:
            entropy = calculate_entropy(file_bytes[:32768]) if file_bytes else 0.0
            if entropy > 7.1:
                return {
                    "verdict": "QUARANTINE",
                    "tier": "P0",
                    "reason": f"High-risk executable with abnormal entropy ({entropy:.2f} > 7.1). Indicates packed/encrypted malware payload.",
                    "confidence": 0.95,
                    "heuristic": "high_entropy_executable"
                }
            return {
                "verdict": "WARN",
                "tier": "P1",
                "reason": f"Downloaded file is an executable ({DANGEROUS_EXTENSIONS[ext]}). Requires user confirmation before execution.",
                "confidence": 0.90,
                "heuristic": "executable_download"
            }

        return {
            "verdict": "ALLOW",
            "tier": "P3",
            "reason": "File type and structure cleared by pre-execution scanner.",
            "confidence": 0.99,
            "heuristic": "clean"
        }
