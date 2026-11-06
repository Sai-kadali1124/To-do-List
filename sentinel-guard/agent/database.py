"""
SentinelGuard Local Database Manager
Handles event logging, threat verdicts, quarantine history, and user override records.
All data strictly remains on-device with zero telemetry leakage.
"""

import sqlite3
import json
import time
from pathlib import Path
from typing import List, Dict, Any, Optional


class DatabaseManager:
    def __init__(self, db_path: str):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_schema()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def init_schema(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Threat & Protection Events
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL NOT NULL,
                threat_tier TEXT NOT NULL,       -- P0, P1, P2, P3
                category TEXT NOT NULL,          -- phishing, remote_access, download, transaction, etc.
                target TEXT NOT NULL,            -- URL, process name, or file path
                summary TEXT NOT NULL,
                details TEXT,                    -- JSON string of contextual signals
                action_taken TEXT NOT NULL,      -- BLOCKED, WARNED, QUARANTINED, ALLOWED
                overridden INTEGER DEFAULT 0,    -- 0 = No, 1 = Yes
                override_reason TEXT,
                confidence REAL DEFAULT 1.0
            );
            """)

            # Quarantined Files
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS quarantine (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                original_path TEXT NOT NULL,
                quarantine_path TEXT NOT NULL,
                sha256 TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                quarantine_time REAL NOT NULL,
                threat_reason TEXT NOT NULL,
                is_restored INTEGER DEFAULT 0
            );
            """)

            # User Overrides & Whitelist Records
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS overrides (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_type TEXT NOT NULL,         -- domain, process, file_hash
                item_value TEXT NOT NULL,
                created_at REAL NOT NULL,
                notes TEXT
            );
            """)

            conn.commit()

    def log_event(self, threat_tier: str, category: str, target: str, summary: str,
                  action_taken: str, details: Optional[Dict[str, Any]] = None,
                  confidence: float = 1.0) -> int:
        timestamp = time.time()
        details_str = json.dumps(details or {})
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO events (timestamp, threat_tier, category, target, summary, details, action_taken, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (timestamp, threat_tier, category, target, summary, details_str, action_taken, confidence))
            conn.commit()
            return cursor.lastrowid

    def get_events(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT id, timestamp, threat_tier, category, target, summary, details, action_taken, overridden, override_reason, confidence
            FROM events
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
            """, (limit, offset))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                try:
                    item["details"] = json.loads(item["details"]) if item["details"] else {}
                except Exception:
                    pass
                results.append(item)
            return results

    def override_event(self, event_id: int, reason: str = "User confirmed safe") -> bool:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE events 
            SET overridden = 1, override_reason = ?
            WHERE id = ?
            """, (reason, event_id))
            conn.commit()
            return cursor.rowcount > 0

    def record_quarantine(self, original_path: str, quarantine_path: str, sha256: str,
                          file_name: str, file_size: int, reason: str) -> int:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO quarantine (original_path, quarantine_path, sha256, file_name, file_size, quarantine_time, threat_reason)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (original_path, quarantine_path, sha256, file_name, file_size, time.time(), reason))
            conn.commit()
            return cursor.lastrowid

    def get_quarantined_files(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT id, original_path, quarantine_path, sha256, file_name, file_size, quarantine_time, threat_reason, is_restored
            FROM quarantine
            ORDER BY quarantine_time DESC
            """)
            return [dict(r) for r in cursor.fetchall()]

    def mark_restored(self, quarantine_id: int) -> bool:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE quarantine SET is_restored = 1 WHERE id = ?", (quarantine_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_stats(self) -> Dict[str, Any]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM events")
            total_events = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM events WHERE threat_tier IN ('P0', 'P1') AND action_taken = 'BLOCKED'")
            threats_blocked = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM events WHERE category = 'transaction'")
            transactions_guarded = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM quarantine WHERE is_restored = 0")
            active_quarantines = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM events WHERE overridden = 1")
            overridden_events = cursor.fetchone()[0]

            return {
                "total_events": total_events,
                "threats_blocked": threats_blocked,
                "transactions_guarded": transactions_guarded,
                "active_quarantines": active_quarantines,
                "overridden_events": overridden_events
            }
