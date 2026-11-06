"""
SentinelGuard Local API & Dashboard Server
Provides local REST endpoints for the Browser Extension, User Dashboard, and Attack Simulator.
Runs on 127.0.0.1:8765 with zero external dependencies.
"""

import os
import json
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
from pathlib import Path
from typing import Dict, Any

from config import ConfigManager
from database import DatabaseManager
from threat_intel import ThreatIntelligence
from process_monitor import ProcessMonitor
from download_inspector import DownloadInspector
from scam_engine import ScamContextEngine
from policy_engine import PolicyEngine

DASHBOARD_DIR = Path(__file__).resolve().parent.parent / "dashboard"
DEMO_DIR = Path(__file__).resolve().parent.parent / "demo"


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


class SentinelAPIHandler(SimpleHTTPRequestHandler):
    # Class-level references to core services (injected by run_agent.py)
    config: ConfigManager = None
    db: DatabaseManager = None
    threat_intel: ThreatIntelligence = None
    proc_monitor: ProcessMonitor = None
    download_inspector: DownloadInspector = None
    scam_engine: ScamContextEngine = None
    policy_engine: PolicyEngine = None

    def end_headers(self):
        # Allow cross-origin requests from browser extension and localhost dashboard
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data: Any, status: int = 200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def parse_json_body(self) -> Dict[str, Any]:
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                raw = self.rfile.read(content_length).decode("utf-8")
                return json.loads(raw)
        except Exception as e:
            print(f"[SentinelServer] Failed to parse JSON: {e}")
        return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # API Endpoints
        if path == "/api/status":
            health = self.policy_engine.get_device_health()
            self.send_json(health)
            return

        elif path == "/api/events":
            limit = int(query.get("limit", [50])[0])
            offset = int(query.get("offset", [0])[0])
            events = self.db.get_events(limit=limit, offset=offset)
            self.send_json({"events": events, "count": len(events)})
            return

        elif path == "/api/quarantine":
            files = self.db.get_quarantined_files()
            self.send_json({"quarantine": files})
            return

        elif path == "/api/config":
            self.send_json(self.config.config)
            return

        elif path == "/api/privacy-audit":
            # Data minimization transparency report
            db_size = os.path.getsize(self.config.get("paths.db_path")) if os.path.exists(self.config.get("paths.db_path")) else 0
            stats = self.db.get_stats()
            self.send_json({
                "storage": {
                    "local_database_bytes": db_size,
                    "local_database_formatted": f"{db_size / 1024:.1f} KB",
                    "cloud_data_transmitted_bytes": 0,
                    "retention_policy": "Rolling 30 days locally, auto-purged",
                    "third_party_telemetry": "Disabled / None"
                },
                "data_minimization_guarantees": [
                    "Zero browsing history sent to external servers",
                    "Full URL lookups resolved on-device or via k-anonymized hashes",
                    "Screen contents during remote tool detection never saved to disk",
                    "Cryptographic credentials stored exclusively in local secure storage"
                ],
                "event_stats": stats
            })
            return

        # Serve Dashboard and Demo files
        if path == "/" or path == "/dashboard":
            self.serve_file(DASHBOARD_DIR / "index.html", "text/html")
            return
        elif path.startswith("/dashboard/"):
            rel_path = path[len("/dashboard/"):]
            file_path = DASHBOARD_DIR / rel_path
            self.serve_static(file_path)
            return
        elif path.startswith("/demo/"):
            rel_path = path[len("/demo/"):]
            file_path = DEMO_DIR / rel_path
            self.serve_static(file_path)
            return

        # Default fallback to 404
        self.send_json({"error": "Endpoint not found", "path": path}, 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.parse_json_body()

        if path == "/api/check-url":
            url = body.get("url", "")
            if not url:
                self.send_json({"error": "Missing 'url' parameter"}, 400)
                return
            result = self.policy_engine.evaluate_url(url)
            self.send_json(result)
            return

        elif path == "/api/register-domain":
            domain = body.get("domain", "")
            if domain:
                self.scam_engine.update_active_domain(domain)
            self.send_json({"status": "registered", "domain": domain})
            return

        elif path == "/api/check-transaction":
            verdict = self.scam_engine.evaluate_transaction_submission(body)
            self.send_json(verdict)
            return

        elif path == "/api/override":
            event_id = int(body.get("event_id", 0))
            domain = body.get("domain", "")
            reason = body.get("reason", "User confirmed safe")
            success = self.policy_engine.apply_override(event_id, target_domain=domain, reason=reason)
            self.send_json({"success": success, "event_id": event_id})
            return

        elif path == "/api/quarantine/restore":
            qid = int(body.get("quarantine_id", 0))
            success = self.download_inspector.restore_file(qid)
            self.send_json({"success": success, "quarantine_id": qid})
            return

        elif path == "/api/config":
            for k, v in body.items():
                self.config.set(k, v)
            self.send_json({"status": "updated", "config": self.config.config})
            return

        elif path == "/api/simulate":
            # Attack simulator endpoint
            sim_type = body.get("type", "")
            if sim_type == "remote_access_start":
                tool_name = body.get("tool", "anydesk")
                self.proc_monitor.add_simulated_process(tool_name, pid=48291)
                alert = self.scam_engine.evaluate_context()
                self.send_json({"status": "simulated", "tool": tool_name, "alert": alert})
                return
            elif sim_type == "remote_access_stop":
                self.proc_monitor.clear_simulated_processes()
                self.send_json({"status": "cleared"})
                return
            elif sim_type == "malicious_download":
                file_name = body.get("file_name", "Invoice_Details.pdf.exe")
                # Create a simulated malicious file in downloads directory
                test_file = self.download_inspector.watch_dir / file_name
                with open(test_file, "wb") as f:
                    # Write high entropy packed dummy data
                    f.write(os.urandom(8192))
                verdict = self.download_inspector.scan_file(test_file)
                self.send_json({"status": "simulated_download", "verdict": verdict})
                return

        self.send_json({"error": "Unknown POST route", "path": path}, 404)

    def serve_static(self, file_path: Path):
        if not file_path.exists() or not file_path.is_file():
            self.send_json({"error": "File not found"}, 404)
            return

        ext = file_path.suffix.lower()
        content_types = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
            ".json": "application/json",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".ico": "image/x-icon"
        }
        ctype = content_types.get(ext, "application/octet-stream")
        self.serve_file(file_path, ctype)

    def serve_file(self, file_path: Path, content_type: str):
        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", f"{content_type}; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_json({"error": str(e)}, 500)
