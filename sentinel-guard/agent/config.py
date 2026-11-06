"""
SentinelGuard Configuration & Defaults
Defines policy settings, sensitivity tiers, thresholds, and storage paths.
"""

import os
import json
from pathlib import Path

# Allow overriding base data directory via environment variable or default to project data dir / fallback to /tmp
ENV_DATA_DIR = os.getenv("SENTINEL_DATA_DIR")
if ENV_DATA_DIR:
    BASE_DATA_DIR = Path(ENV_DATA_DIR)
else:
    # Try local project directory first, then home dir, then /tmp
    project_data = Path(__file__).resolve().parent.parent / "data"
    BASE_DATA_DIR = project_data

try:
    BASE_DATA_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    BASE_DATA_DIR = Path("/tmp/sentinel_guard")
    BASE_DATA_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_CONFIG = {
    "version": "1.0.0",
    "sensitivity_mode": "balanced",  # "strict", "balanced", "relaxed"
    "protection_modules": {
        "browser_shield": True,
        "remote_access_interceptor": True,
        "download_inspector": True,
        "transaction_guardrails": True,
        "credential_leak_monitor": True
    },
    "transaction_guardrails": {
        "transfer_threshold": 500.0,
        "require_new_payee_confirmation": True,
        "pause_on_remote_tool_active": True,
        "flag_crypto_destination_changes": True
    },
    "paths": {
        "downloads_dir": str(BASE_DATA_DIR / "downloads"),
        "quarantine_dir": str(BASE_DATA_DIR / "quarantine"),
        "db_path": str(BASE_DATA_DIR / "sentinel.db"),
        "config_path": str(BASE_DATA_DIR / "config.json")
    },
    "allowlist": {
        "domains": [
            "chase.com",
            "bankofamerica.com",
            "wellsfargo.com",
            "citi.com",
            "fidelity.com",
            "schwab.com",
            "paypal.com",
            "google.com",
            "apple.com",
            "microsoft.com",
            "github.com"
        ],
        "processes": [],
        "hashes": []
    },
    "api": {
        "host": "127.0.0.1",
        "port": 8765,
        "auth_token": "sentinel-local-dev-token"
    }
}


class ConfigManager:
    def __init__(self, config_file: Path = None):
        self.config_path = config_file or Path(DEFAULT_CONFIG["paths"]["config_path"])
        self.config = self.load()

    def load(self):
        if self.config_path.exists():
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                    # Merge with defaults
                    merged = dict(DEFAULT_CONFIG)
                    for k, v in saved.items():
                        if isinstance(v, dict) and k in merged and isinstance(merged[k], dict):
                            merged[k].update(v)
                        else:
                            merged[k] = v
                    return merged
            except Exception as e:
                print(f"[ConfigManager] Error reading config: {e}. Falling back to defaults.")
        return dict(DEFAULT_CONFIG)

    def save(self):
        try:
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump(self.config, f, indent=2)
            return True
        except Exception as e:
            print(f"[ConfigManager] Failed to save config: {e}")
            return False

    def get(self, key, default=None):
        keys = key.split(".")
        val = self.config
        for k in keys:
            if isinstance(val, dict) and k in val:
                val = val[k]
            else:
                return default
        return val

    def set(self, key, value):
        keys = key.split(".")
        target = self.config
        for k in keys[:-1]:
            if k not in target or not isinstance(target[k], dict):
                target[k] = {}
            target = target[k]
        target[keys[-1]] = value
        self.save()

    def is_domain_allowed(self, domain: str) -> bool:
        domain = domain.lower().strip()
        allowed = [d.lower() for d in self.get("allowlist.domains", [])]
        for d in allowed:
            if domain == d or domain.endswith("." + d):
                return True
        return False
