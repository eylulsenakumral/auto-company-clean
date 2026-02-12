#!/usr/bin/env python3
"""Local dashboard server for Auto Company (Windows + WSL runtime)."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import time
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse


REPO_ROOT ***REMOVED*** Path(__file__).resolve().parents[1]
DASHBOARD_DIR ***REMOVED*** Path(__file__).resolve().parent

STATUS_SCRIPT ***REMOVED*** REPO_ROOT / "scripts" / "windows" / "status-win.ps1"
START_SCRIPT ***REMOVED*** REPO_ROOT / "scripts" / "windows" / "start-win.ps1"
STOP_SCRIPT ***REMOVED*** REPO_ROOT / "scripts" / "windows" / "stop-win.ps1"

LOG_FILE ***REMOVED*** REPO_ROOT / "logs" / "auto-loop.log"
STATE_FILE ***REMOVED*** REPO_ROOT / ".auto-loop-state"
CONSENSUS_FILE ***REMOVED*** REPO_ROOT / "memories" / "consensus.md"


def ps_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def run_powershell_script(script_path: Path, args: list[str] | None ***REMOVED*** None, timeout: int ***REMOVED*** 90) -> dict[str, Any]:
    invocation ***REMOVED*** f"& {ps_quote(str(script_path))}"
    if args:
        invocation +***REMOVED*** " " + " ".join(ps_quote(arg) for arg in args)

    cmd ***REMOVED*** [
        "powershell",
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        (
            "$ErrorActionPreference***REMOVED***'Stop'; "
            "[Console]::OutputEncoding***REMOVED***[System.Text.Encoding]::UTF8; "
            "$OutputEncoding***REMOVED***[System.Text.Encoding]::UTF8; "
            f"{invocation} *>&1 | Out-String"
        ),
    ]

    start ***REMOVED*** time.time()
    proc ***REMOVED*** subprocess.run(
        cmd,
        cwd***REMOVED***str(REPO_ROOT),
        capture_output***REMOVED***True,
        text***REMOVED***True,
        encoding***REMOVED***"utf-8",
        errors***REMOVED***"replace",
        timeout***REMOVED***timeout,
    )
    elapsed_ms ***REMOVED*** int((time.time() - start) * 1000)

    output ***REMOVED*** (proc.stdout or "").strip()
    error ***REMOVED*** (proc.stderr or "").strip()
    combined ***REMOVED*** output
    if error:
        combined ***REMOVED*** f"{output}\n{error}".strip()

    return {
        "ok": proc.returncode ***REMOVED******REMOVED*** 0,
        "exitCode": proc.returncode,
        "elapsedMs": elapsed_ms,
        "output": combined,
    }


def read_text_file(path: Path, fallback: str ***REMOVED*** "") -> str:
    try:
        raw ***REMOVED*** path.read_bytes()
    except FileNotFoundError:
        return fallback
    except Exception as exc:  # pragma: no cover - defensive
        return f"(read error: {exc})"

    for enc in ("utf-8", "utf-8-sig", "gb18030", "cp936"):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            continue

    return raw.decode("utf-8", errors***REMOVED***"replace")


def read_tail(path: Path, lines: int ***REMOVED*** 120) -> str:
    if lines <***REMOVED*** 0:
        return ""
    text ***REMOVED*** read_text_file(path, "")
    if not text:
        return ""
    rows ***REMOVED*** text.splitlines()
    return "\n".join(rows[-lines:])


def parse_status_output(raw: str) -> dict[str, Any]:
    section_re ***REMOVED*** re.compile(r"^***REMOVED******REMOVED******REMOVED*** (.+) ***REMOVED******REMOVED******REMOVED***$")
    sections: dict[str, list[str]] ***REMOVED*** {}
    current ***REMOVED*** None

    for line in raw.splitlines():
        line ***REMOVED*** line.rstrip("\n")
        m ***REMOVED*** section_re.match(line.strip())
        if m:
            current ***REMOVED*** m.group(1)
            sections[current] ***REMOVED*** []
            continue
        if current is not None:
            sections[current].append(line)

    parsed: dict[str, Any] ***REMOVED*** {
        "guardian": {"state": "unknown", "pid": None, "raw": ""},
        "autostart": {"state": "unknown", "raw": ""},
        "daemon": {
            "state": "unknown",
            "activeState": "unknown",
            "subState": "unknown",
            "mainPid": None,
            "raw": "",
        },
        "loop": {
            "state": "unknown",
            "pid": None,
            "daemonSummary": "unknown",
            "engine": "",
            "model": "",
            "lastRun": "",
            "errorCount": "",
            "loopCount": "",
            "raw": "",
        },
        "consensusPreview": "",
        "recentLog": "",
    }

    guardian_rows ***REMOVED*** sections.get("Windows Guardian", [])
    guardian_line ***REMOVED*** next((x.strip() for x in guardian_rows if x.strip().startswith("Awake guardian:")), "")
    parsed["guardian"]["raw"] ***REMOVED*** "\n".join(guardian_rows).strip()
    if guardian_line:
        parsed["guardian"]["raw"] ***REMOVED*** guardian_line
        if "RUNNING" in guardian_line:
            parsed["guardian"]["state"] ***REMOVED*** "running"
            pid_m ***REMOVED*** re.search(r"PID (\d+)", guardian_line)
            parsed["guardian"]["pid"] ***REMOVED*** int(pid_m.group(1)) if pid_m else None
        elif "STOPPED" in guardian_line:
            parsed["guardian"]["state"] ***REMOVED*** "stopped"

    autostart_rows ***REMOVED*** sections.get("Windows Autostart Task", [])
    autostart_line ***REMOVED*** next((x.strip() for x in autostart_rows if x.strip().startswith("Autostart:")), "")
    parsed["autostart"]["raw"] ***REMOVED*** "\n".join(autostart_rows).strip()
    if autostart_line:
        parsed["autostart"]["raw"] ***REMOVED*** autostart_line
        if "NOT CONFIGURED" in autostart_line:
            parsed["autostart"]["state"] ***REMOVED*** "not_configured"
        elif "CONFIGURED" in autostart_line:
            parsed["autostart"]["state"] ***REMOVED*** "configured"
        else:
            parsed["autostart"]["state"] ***REMOVED*** "unknown"

    daemon_rows ***REMOVED*** sections.get("WSL Daemon (systemd --user)", [])
    parsed["daemon"]["raw"] ***REMOVED*** "\n".join(daemon_rows).strip()
    daemon_compact ***REMOVED*** [x.strip() for x in daemon_rows if x.strip()]
    if daemon_compact:
        first ***REMOVED*** daemon_compact[0]
        if "not installed" in first.lower():
            parsed["daemon"]["state"] ***REMOVED*** "not_installed"
        elif first in {"active", "inactive", "activating", "failed"}:
            parsed["daemon"]["state"] ***REMOVED*** first
        for row in daemon_compact:
            if row.startswith("MainPID***REMOVED***"):
                val ***REMOVED*** row.split("***REMOVED***", 1)[1].strip()
                parsed["daemon"]["mainPid"] ***REMOVED*** int(val) if val.isdigit() else None
            elif row.startswith("ActiveState***REMOVED***"):
                parsed["daemon"]["activeState"] ***REMOVED*** row.split("***REMOVED***", 1)[1].strip()
            elif row.startswith("SubState***REMOVED***"):
                parsed["daemon"]["subState"] ***REMOVED*** row.split("***REMOVED***", 1)[1].strip()

    loop_rows ***REMOVED*** sections.get("Loop Status (scripts/core/monitor.sh)") or sections.get("Loop Status (monitor.sh)", [])
    loop_status_rows ***REMOVED*** sections.get("Auto Company Status", [])
    merged_loop_rows ***REMOVED*** list(loop_rows) + list(loop_status_rows)
    parsed["loop"]["raw"] ***REMOVED*** "\n".join(merged_loop_rows).strip()
    loop_compact ***REMOVED*** [x.strip() for x in merged_loop_rows if x.strip()]
    for row in loop_compact:
        if row.startswith("Loop:"):
            if "RUNNING" in row:
                parsed["loop"]["state"] ***REMOVED*** "running"
                pid_m ***REMOVED*** re.search(r"PID (\d+)", row)
                parsed["loop"]["pid"] ***REMOVED*** int(pid_m.group(1)) if pid_m else None
            elif "NOT RUNNING" in row or "STOPPED" in row:
                parsed["loop"]["state"] ***REMOVED*** "stopped"
        elif row.startswith("Daemon:"):
            parsed["loop"]["daemonSummary"] ***REMOVED*** row.replace("Daemon:", "", 1).strip()
        elif row.startswith("ENGINE***REMOVED***"):
            parsed["loop"]["engine"] ***REMOVED*** row.split("***REMOVED***", 1)[1].strip()
        elif row.startswith("MODEL***REMOVED***"):
            parsed["loop"]["model"] ***REMOVED*** row.split("***REMOVED***", 1)[1].strip()
        elif row.startswith("LAST_RUN***REMOVED***"):
            parsed["loop"]["lastRun"] ***REMOVED*** row.split("***REMOVED***", 1)[1].strip()
        elif row.startswith("ERROR_COUNT***REMOVED***"):
            parsed["loop"]["errorCount"] ***REMOVED*** row.split("***REMOVED***", 1)[1].strip()
        elif row.startswith("LOOP_COUNT***REMOVED***"):
            parsed["loop"]["loopCount"] ***REMOVED*** row.split("***REMOVED***", 1)[1].strip()

    consensus_rows ***REMOVED*** sections.get("Latest Consensus", [])
    parsed["consensusPreview"] ***REMOVED*** "\n".join(consensus_rows).strip()
    recent_rows ***REMOVED*** sections.get("Recent Log", [])
    parsed["recentLog"] ***REMOVED*** "\n".join(recent_rows).strip()

    return parsed


def gather_status_payload() -> dict[str, Any]:
    result ***REMOVED*** run_powershell_script(STATUS_SCRIPT, timeout***REMOVED***90)
    parsed ***REMOVED*** parse_status_output(result["output"])

    state_text ***REMOVED*** read_text_file(STATE_FILE, "").strip()
    state_pairs: dict[str, str] ***REMOVED*** {}
    if state_text:
        for row in state_text.splitlines():
            if "***REMOVED***" in row:
                k, v ***REMOVED*** row.split("***REMOVED***", 1)
                state_pairs[k.strip()] ***REMOVED*** v.strip()

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ok": result["ok"],
        "exitCode": result["exitCode"],
        "elapsedMs": result["elapsedMs"],
        "raw": result["output"],
        "parsed": parsed,
        "stateFile": state_pairs,
        "consensusHead": read_text_file(CONSENSUS_FILE, "(no consensus file)")[:3000],
        "logTail": read_tail(LOG_FILE, lines***REMOVED***180),
    }


class DashboardHandler(BaseHTTPRequestHandler):
    def _json(self, payload: dict[str, Any], code: int ***REMOVED*** 200) -> None:
        raw ***REMOVED*** json.dumps(payload, ensure_ascii***REMOVED***False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset***REMOVED***utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _text(self, text: str, code: int ***REMOVED*** 200, content_type: str ***REMOVED*** "text/plain; charset***REMOVED***utf-8") -> None:
        raw ***REMOVED*** text.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _serve_file(self, path: Path, content_type: str) -> None:
        if not path.exists():
            self._text("Not found", code***REMOVED***404)
            return
        self._text(path.read_text(encoding***REMOVED***"utf-8"), content_type***REMOVED***content_type)

    def do_GET(self) -> None:  # noqa: N802
        parsed ***REMOVED*** urlparse(self.path)
        path ***REMOVED*** parsed.path

        if path ***REMOVED******REMOVED*** "/" or path ***REMOVED******REMOVED*** "/index.html":
            self._serve_file(DASHBOARD_DIR / "index.html", "text/html; charset***REMOVED***utf-8")
            return
        if path ***REMOVED******REMOVED*** "/app.js":
            self._serve_file(DASHBOARD_DIR / "app.js", "application/javascript; charset***REMOVED***utf-8")
            return
        if path ***REMOVED******REMOVED*** "/styles.css":
            self._serve_file(DASHBOARD_DIR / "styles.css", "text/css; charset***REMOVED***utf-8")
            return
        if path ***REMOVED******REMOVED*** "/favicon.svg":
            self._serve_file(DASHBOARD_DIR / "favicon.svg", "image/svg+xml")
            return
        if path ***REMOVED******REMOVED*** "/api/status":
            self._json(gather_status_payload())
            return
        if path ***REMOVED******REMOVED*** "/api/log-tail":
            qs ***REMOVED*** parse_qs(parsed.query)
            lines ***REMOVED*** int(qs.get("lines", ["180"])[0])
            self._json(
                {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "lines": lines,
                    "logTail": read_tail(LOG_FILE, lines***REMOVED***lines),
                }
            )
            return

        self._text("Not found", code***REMOVED***404)

    def do_POST(self) -> None:  # noqa: N802
        parsed ***REMOVED*** urlparse(self.path)
        path ***REMOVED*** parsed.path
        if path not in {"/api/action/start", "/api/action/stop", "/api/action/refresh"}:
            self._text("Not found", code***REMOVED***404)
            return

        if path.endswith("/start"):
            res ***REMOVED*** run_powershell_script(START_SCRIPT, timeout***REMOVED***120)
        elif path.endswith("/stop"):
            res ***REMOVED*** run_powershell_script(STOP_SCRIPT, timeout***REMOVED***120)
        else:
            res ***REMOVED*** run_powershell_script(STATUS_SCRIPT, timeout***REMOVED***90)

        payload ***REMOVED*** {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": path.rsplit("/", 1)[-1],
            "ok": res["ok"],
            "exitCode": res["exitCode"],
            "elapsedMs": res["elapsedMs"],
            "output": res["output"],
        }
        self._json(payload, code***REMOVED***HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST)

    def log_message(self, fmt: str, *args: Any) -> None:  # noqa: A003
        # Keep console noise low for dashboard usage.
        _ ***REMOVED*** (fmt, args)


def main() -> None:
    parser ***REMOVED*** argparse.ArgumentParser(description***REMOVED***"Auto Company web dashboard server")
    parser.add_argument("--host", default***REMOVED***"127.0.0.1")
    parser.add_argument("--port", type***REMOVED***int, default***REMOVED***8787)
    args ***REMOVED*** parser.parse_args()

    server ***REMOVED*** ThreadingHTTPServer((args.host, args.port), DashboardHandler)
    print(f"[dashboard] serving on http://{args.host}:{args.port}")
    print(f"[dashboard] repo: {REPO_ROOT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        print("[dashboard] stopped")


if __name__ ***REMOVED******REMOVED*** "__main__":
    os.chdir(REPO_ROOT)
    main()
