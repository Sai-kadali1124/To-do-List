"""
SentinelGuard Download Inspector
Monitors the user's Downloads directory in real-time, scanning newly arrived
files before user execution. Automatically quarantines dangerous payloads
and produces clear, educational remediation placeholders.
"""

import os
import shutil
import hashlib
import threading
import time
from pathlib import Path
from typing import Dict, Any, Callable, Optional, Set
from threat_intel import ThreatIntelligence
from database import DatabaseManager


class DownloadInspector:
    def __init__(self, watch_dir: str, quarantine_dir: str, db: DatabaseManager,
                 threat_intel: ThreatIntelligence, callback: Optional[Callable[[Dict[str, Any]], None]] = None):
        self.watch_dir = Path(watch_dir)
        self.quarantine_dir = Path(quarantine_dir)
        self.db = db
        self.threat_intel = threat_intel
        self.callback = callback
        
        self.watch_dir.mkdir(parents=True, exist_ok=True)
        self.quarantine_dir.mkdir(parents=True, exist_ok=True)
        
        self._seen_files: Set[str] = set()
        self.is_running = False
        self._thread: Optional[threading.Thread] = None

    def _init_seen_files(self):
        """Pre-populates existing files so they are not treated as fresh downloads on startup."""
        if self.watch_dir.exists():
            for f in self.watch_dir.iterdir():
                if f.is_file():
                    self._seen_files.add(f.name)

    def calculate_file_hash(self, file_path: Path) -> str:
        sha256 = hashlib.sha256()
        try:
            with open(file_path, "rb") as f:
                while chunk := f.read(65536):
                    sha256.update(chunk)
            return sha256.hexdigest()
        except Exception:
            return ""

    def scan_file(self, file_path: Path) -> Dict[str, Any]:
        """Reads file header and evaluates threat posture."""
        if not file_path.exists() or not file_path.is_file():
            return {"verdict": "ERROR", "reason": "File does not exist"}

        try:
            # Wait briefly if file is still being written by browser download
            initial_size = file_path.stat().st_size
            time.sleep(0.3)
            current_size = file_path.stat().st_size
            retries = 3
            while current_size != initial_size and retries > 0:
                time.sleep(0.3)
                initial_size = current_size
                current_size = file_path.stat().st_size
                retries -= 1

            with open(file_path, "rb") as f:
                header_bytes = f.read(65536)

            file_hash = self.calculate_file_hash(file_path)
            verdict_info = self.threat_intel.evaluate_file(file_path.name, header_bytes)
            verdict_info["file_name"] = file_path.name
            verdict_info["file_size"] = current_size
            verdict_info["sha256"] = file_hash
            verdict_info["original_path"] = str(file_path)

            if verdict_info["verdict"] == "QUARANTINE":
                self.quarantine_file(file_path, verdict_info)

            return verdict_info

        except Exception as e:
            return {"verdict": "ERROR", "reason": str(e), "file_name": file_path.name}

    def quarantine_file(self, file_path: Path, threat_info: Dict[str, Any]) -> str:
        """Moves file to isolated quarantine and writes a safe explanatory placeholder."""
        sha256 = threat_info.get("sha256", "unknown")
        quarantine_target = self.quarantine_dir / f"{sha256}_{file_path.name}.quarantine"
        
        try:
            shutil.move(str(file_path), str(quarantine_target))
            
            # Place educational note in original directory
            placeholder_path = file_path.parent / f"{file_path.name}.PROTECTED_BY_SENTINEL.txt"
            with open(placeholder_path, "w", encoding="utf-8") as f:
                f.write(
                    f"==========================================================\n"
                    f"SENTINEL GUARD PREVENTIVE INTERCEPTION NOTICE\n"
                    f"==========================================================\n\n"
                    f"File Name: {file_path.name}\n"
                    f"Status: Safely Quarantined Before Execution\n"
                    f"Threat Reason: {threat_info.get('reason')}\n"
                    f"SHA-256: {sha256}\n\n"
                    f"Why was this blocked?\n"
                    f"SentinelGuard inspected this download and detected a deceptive pattern\n"
                    f"or high-entropy payload typical of ransomware/trojan droppers.\n\n"
                    f"Need this file anyway?\n"
                    f"Open your SentinelGuard Dashboard (http://localhost:8765/dashboard)\n"
                    f"to review the technical analysis and restore it with one click.\n"
                    f"==========================================================\n"
                )

            # Record in database
            qid = self.db.record_quarantine(
                original_path=str(file_path),
                quarantine_path=str(quarantine_target),
                sha256=sha256,
                file_name=file_path.name,
                file_size=threat_info.get("file_size", 0),
                reason=threat_info.get("reason", "Heuristic quarantine")
            )

            # Log threat event
            self.db.log_event(
                threat_tier="P0",
                category="download",
                target=file_path.name,
                summary=f"Prevented execution of malicious download: {file_path.name}",
                action_taken="QUARANTINED",
                details={
                    "quarantine_id": qid,
                    "sha256": sha256,
                    "reason": threat_info.get("reason"),
                    "heuristic": threat_info.get("heuristic")
                },
                confidence=threat_info.get("confidence", 1.0)
            )

            threat_info["quarantine_id"] = qid
            threat_info["quarantine_target"] = str(quarantine_target)

            if self.callback:
                self.callback({
                    "event": "FILE_QUARANTINED",
                    "info": threat_info
                })

            return str(quarantine_target)

        except Exception as e:
            print(f"[DownloadInspector] Quarantine failed: {e}")
            return ""

    def restore_file(self, quarantine_id: int) -> bool:
        """Restores a quarantined file back to its original location upon user override."""
        records = [r for r in self.db.get_quarantined_files() if r["id"] == quarantine_id]
        if not records:
            return False
        rec = records[0]
        q_path = Path(rec["quarantine_path"])
        orig_path = Path(rec["original_path"])

        if not q_path.exists():
            return False

        try:
            orig_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(q_path), str(orig_path))
            
            # Remove notice placeholder if still exists
            placeholder = orig_path.parent / f"{orig_path.name}.PROTECTED_BY_SENTINEL.txt"
            if placeholder.exists():
                placeholder.unlink()

            self.db.mark_restored(quarantine_id)
            self.db.log_event(
                threat_tier="P1",
                category="download",
                target=orig_path.name,
                summary=f"User restored previously quarantined file: {orig_path.name}",
                action_taken="RESTORED",
                details={"quarantine_id": quarantine_id, "file_name": orig_path.name}
            )
            return True
        except Exception as e:
            print(f"[DownloadInspector] Error restoring file: {e}")
            return False

    def _watch_loop(self):
        while self.is_running:
            try:
                if self.watch_dir.exists():
                    current_files = {f.name: f for f in self.watch_dir.iterdir() if f.is_file()}
                    new_file_names = set(current_files.keys()) - self._seen_files

                    for name in new_file_names:
                        # Skip temporary download parts or our own placeholder notices
                        if name.endswith(".crdownload") or name.endswith(".part") or name.endswith(".download") or ".PROTECTED_BY_SENTINEL" in name:
                            continue
                        
                        file_obj = current_files[name]
                        self._seen_files.add(name)
                        self.scan_file(file_obj)

            except Exception as e:
                print(f"[DownloadInspector] Error in watch loop: {e}")

            time.sleep(1.0)

    def start(self):
        if not self.is_running:
            self.is_running = True
            self._init_seen_files()
            self._thread = threading.Thread(target=self._watch_loop, daemon=True, name="DownloadInspectorThread")
            self._thread.start()

    def stop(self):
        self.is_running = False
        if self._thread:
            self._thread.join(timeout=2.0)
