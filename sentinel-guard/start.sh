#!/bin/bash
# ==============================================================================
# SentinelGuard — One-Command Bootstrap Launcher
# Starts the background agent daemon and launches the User Dashboard.
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PYTHONPATH="$PROJECT_DIR/agent:$PYTHONPATH"

echo "=================================================================="
echo "          SENTINEL GUARD — PROACTIVE ENDPOINT SHIELD              "
echo "              Starting Agent & Security Dashboard                 "
echo "=================================================================="

# Check Python 3
PYTHON_BIN="/usr/bin/python3"
if [ ! -f "$PYTHON_BIN" ]; then
    PYTHON_BIN="python3"
fi

echo "[*] Using Python: $PYTHON_BIN"
echo "[*] Working Directory: $PROJECT_DIR"

# Launch Agent in Background
"$PYTHON_BIN" "$PROJECT_DIR/agent/run_agent.py" &
AGENT_PID=$!
echo "[+] SentinelGuard Daemon running with PID: $AGENT_PID"

# Wait for server to bind
sleep 1.5

DASHBOARD_URL="http://127.0.0.1:8765/dashboard"
echo "[+] Opening Dashboard in your browser: $DASHBOARD_URL"

# Open in default browser based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$DASHBOARD_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$DASHBOARD_URL" 2>/dev/null || sensible-browser "$DASHBOARD_URL" 2>/dev/null || true
fi

echo ""
echo "Press Ctrl+C to stop SentinelGuard."
wait $AGENT_PID
