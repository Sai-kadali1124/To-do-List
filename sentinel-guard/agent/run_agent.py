"""
SentinelGuard Desktop Agent Entry Point
Initializes all core engines and starts the background monitoring threads and API server.
"""

import sys
import signal
import time
from pathlib import Path

# Add current directory to sys.path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from config import ConfigManager
from database import DatabaseManager
from threat_intel import ThreatIntelligence
from process_monitor import ProcessMonitor
from download_inspector import DownloadInspector
from scam_engine import ScamContextEngine
from policy_engine import PolicyEngine
from server import ThreadedHTTPServer, SentinelAPIHandler


def main():
    print("==================================================================")
    print("           SENTINEL GUARD — PREVENTIVE ENDPOINT AGENT             ")
    print("             Pervasive, Proactive Security Architecture           ")
    print("==================================================================")

    # 1. Initialize Configuration
    config = ConfigManager()
    print(f"[*] Loaded configuration (Sensitivity: {config.get('sensitivity_mode')})")

    # 2. Initialize Database
    db_path = config.get("paths.db_path")
    db = DatabaseManager(db_path)
    print(f"[*] Initialized local database at: {db_path}")

    # 3. Initialize Threat Intelligence
    threat_intel = ThreatIntelligence()
    print("[*] Threat intelligence feeds & heuristic models active")

    # 4. Initialize Process Monitor
    proc_monitor = ProcessMonitor(check_interval=2.0)
    proc_monitor.start()
    print("[*] Real-time Process Monitor active (scanning for Remote Access Tools)")

    # 5. Initialize Download Inspector
    downloads_dir = config.get("paths.downloads_dir")
    quarantine_dir = config.get("paths.quarantine_dir")
    download_inspector = DownloadInspector(
        watch_dir=downloads_dir,
        quarantine_dir=quarantine_dir,
        db=db,
        threat_intel=threat_intel
    )
    download_inspector.start()
    print(f"[*] Download Inspector active (watching {downloads_dir})")
    print(f"[*] File Quarantine vault mounted at {quarantine_dir}")

    # 6. Initialize Scam Context Engine
    scam_engine = ScamContextEngine(
        db=db,
        config=config,
        proc_monitor=proc_monitor,
        threat_intel=threat_intel
    )
    print("[*] Scam Context Engine active (correlating process, financial & network moments)")

    # 7. Initialize Policy Engine
    policy_engine = PolicyEngine(
        config=config,
        db=db,
        threat_intel=threat_intel,
        proc_monitor=proc_monitor
    )
    print("[*] Policy Engine calibrated")

    # 8. Inject dependencies into API Server
    SentinelAPIHandler.config = config
    SentinelAPIHandler.db = db
    SentinelAPIHandler.threat_intel = threat_intel
    SentinelAPIHandler.proc_monitor = proc_monitor
    SentinelAPIHandler.download_inspector = download_inspector
    SentinelAPIHandler.scam_engine = scam_engine
    SentinelAPIHandler.policy_engine = policy_engine

    host = config.get("api.host", "127.0.0.1")
    port = int(config.get("api.port", 8765))

    server = ThreadedHTTPServer((host, port), SentinelAPIHandler)
    print(f"\n[+] SentinelGuard Control Server running on: http://{host}:{port}")
    print(f"[+] User Dashboard accessible at:           http://{host}:{port}/dashboard")
    print(f"[+] Attack Simulator accessible at:         http://{host}:{port}/demo/simulate_scam.py\n")

    def shutdown_handler(sig, frame):
        print("\n[*] Stopping SentinelGuard agent background threads...")
        proc_monitor.stop()
        download_inspector.stop()
        server.shutdown()
        server.server_close()
        print("[*] SentinelGuard agent cleanly terminated.")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        shutdown_handler(None, None)


if __name__ == "__main__":
    main()
