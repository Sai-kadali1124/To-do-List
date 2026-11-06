"""
SentinelGuard Process Monitor
Periodically monitors active operating system processes to detect the launch
and execution of Remote Access Tools (RATs) and screen-sharing software.
Zero external dependencies (uses native OS commands).
"""

import sys
import subprocess
import threading
import time
from typing import List, Dict, Any, Callable, Optional
from threat_intel import KNOWN_REMOTE_ACCESS_TOOLS


class ProcessMonitor:
    def __init__(self, check_interval: float = 2.0, callback: Optional[Callable[[Dict[str, Any]], None]] = None):
        self.check_interval = check_interval
        self.callback = callback
        self.is_running = False
        self._thread: Optional[threading.Thread] = None
        self.active_remote_tools: Dict[str, Dict[str, Any]] = {}
        self._simulated_processes: List[Dict[str, Any]] = []

    def get_system_processes(self) -> List[Dict[str, Any]]:
        """Queries running system processes across macOS, Linux, and Windows."""
        processes = []
        try:
            if sys.platform == "win32":
                cmd = ["tasklist", "/FO", "CSV", "/NH"]
                output = subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL)
                for line in output.strip().splitlines():
                    parts = [p.strip(' "') for p in line.split('","')]
                    if len(parts) >= 2:
                        processes.append({
                            "name": parts[0].lower(),
                            "pid": int(parts[1]) if parts[1].isdigit() else 0,
                            "cmd": parts[0]
                        })
            else:
                # macOS / Linux
                cmd = ["ps", "-eo", "pid,comm"]
                output = subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL)
                for line in output.strip().splitlines()[1:]:
                    parts = line.strip().split(None, 1)
                    if len(parts) == 2:
                        pid_str, comm = parts
                        processes.append({
                            "name": comm.split("/")[-1].lower(),
                            "pid": int(pid_str) if pid_str.isdigit() else 0,
                            "cmd": comm
                        })
        except Exception as e:
            # Fallback if ps / tasklist fails
            pass

        # Include any simulated processes (used for testing and attack simulations)
        for sim in self._simulated_processes:
            processes.append(sim)

        return processes

    def scan_for_remote_tools(self) -> Dict[str, Dict[str, Any]]:
        """Evaluates active processes against the remote access signatures catalog."""
        running_tools = {}
        all_procs = self.get_system_processes()

        for proc in all_procs:
            proc_name = proc["name"]
            for tool_key, tool_info in KNOWN_REMOTE_ACCESS_TOOLS.items():
                for binary in tool_info["binaries"]:
                    if binary in proc_name or proc_name == binary:
                        running_tools[tool_key] = {
                            "name": tool_info["name"],
                            "pid": proc["pid"],
                            "binary": proc_name,
                            "description": tool_info["description"],
                            "first_seen": time.time()
                        }
        return running_tools

    def add_simulated_process(self, name: str, pid: int = 99999):
        """Allows test scripts and attack simulators to simulate a running RAT."""
        self._simulated_processes.append({"name": name.lower(), "pid": pid, "cmd": name})

    def clear_simulated_processes(self):
        self._simulated_processes.clear()

    def _monitor_loop(self):
        while self.is_running:
            try:
                current_tools = self.scan_for_remote_tools()
                
                # Check for newly started tools
                for tool_key, tool_data in current_tools.items():
                    if tool_key not in self.active_remote_tools:
                        self.active_remote_tools[tool_key] = tool_data
                        if self.callback:
                            self.callback({
                                "event": "REMOTE_TOOL_STARTED",
                                "tool": tool_data
                            })
                
                # Check for stopped tools
                stopped = [k for k in self.active_remote_tools if k not in current_tools]
                for k in stopped:
                    tool_data = self.active_remote_tools.pop(k)
                    if self.callback:
                        self.callback({
                            "event": "REMOTE_TOOL_STOPPED",
                            "tool": tool_data
                        })

            except Exception as e:
                print(f"[ProcessMonitor] Error in scan loop: {e}")

            time.sleep(self.check_interval)

    def start(self):
        if not self.is_running:
            self.is_running = True
            self._thread = threading.Thread(target=self._monitor_loop, daemon=True, name="ProcessMonitorThread")
            self._thread.start()

    def stop(self):
        self.is_running = False
        if self._thread:
            self._thread.join(timeout=2.0)
