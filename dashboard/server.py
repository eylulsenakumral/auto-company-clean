#!/usr/bin/env python3
"""Local dashboard server for Auto Company (Windows + WSL + macOS runtime)."""

from __future__ import annotations

import argparse
import json
import os
import platform
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

WINDOWS_STATUS_SCRIPT ***REMOVED*** REPO_ROOT / "scripts" / "windows" / "status-win.ps1"
WINDOWS_START_SCRIPT ***REMOVED*** REPO_ROOT / "scripts" / "windows" / "start-win.ps1"
WINDOWS_STOP_SCRIPT ***REMOVED*** REPO_ROOT / "scripts" / "windows" / "stop-win.ps1"

MACOS_STATUS_SCRIPT ***REMOVED*** REPO_ROOT / "scripts" / "macos" / "status-mac.sh"
MACOS_START_SCRIPT ***REMOVED*** REPO_ROOT / "scripts" / "macos" / "install-daemon.sh"
MACOS_STOP_SCRIPT ***REMOVED*** REPO_ROOT / "scripts" / "core" / "stop-loop.sh"

LOG_FILE ***REMOVED*** REPO_ROOT / "logs" / "auto-loop.log"
STATE_FILE ***REMOVED*** REPO_ROOT / ".auto-loop-state"
CONSENSUS_FILE ***REMOVED*** REPO_ROOT / "memories" / "consensus.md"

WINDOWS_HOST ***REMOVED*** "windows"
MACOS_HOST ***REMOVED*** "macos"


def ps_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def detect_host_kind(system_name: str | None ***REMOVED*** None) -> str:
    name ***REMOVED*** system_name or platform.system()
    if name ***REMOVED******REMOVED*** "Windows":
        return WINDOWS_HOST
    if name ***REMOVED******REMOVED*** "Darwin":
        return MACOS_HOST
    raise RuntimeError(
        "Dashboard only supports Windows hosts (with WSL backend) and macOS hosts."
    )


def run_powershell_script(
    script_path: Path, args: list[str] | None ***REMOVED*** None, timeout: int ***REMOVED*** 90
) -> dict[str, Any]:
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


def run_shell_script(
    script_path: Path, args: list[str] | None ***REMOVED*** None, timeout: int ***REMOVED*** 90
) -> dict[str, Any]:
    cmd ***REMOVED*** ["/bin/bash", str(script_path)]
    if args:
        cmd.extend(args)

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


def get_host_profile(system_name: str | None ***REMOVED*** None) -> dict[str, Any]:
    host ***REMOVED*** detect_host_kind(system_name)
    if host ***REMOVED******REMOVED*** WINDOWS_HOST:
        return {
            "host": host,
            "runner": run_powershell_script,
            "parser": parse_windows_status_output,
            "status_script": WINDOWS_STATUS_SCRIPT,
            "start_script": WINDOWS_START_SCRIPT,
            "start_args": None,
            "stop_script": WINDOWS_STOP_SCRIPT,
            "stop_args": None,
        }
    return {
        "host": host,
        "runner": run_shell_script,
        "parser": parse_macos_status_output,
        "status_script": MACOS_STATUS_SCRIPT,
        "start_script": MACOS_START_SCRIPT,
        "start_args": None,
        "stop_script": MACOS_STOP_SCRIPT,
        "stop_args": ["--pause-daemon"],
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


def parse_sections(raw: str) -> dict[str, list[str]]:
    section_re ***REMOVED*** re.compile(r"^***REMOVED******REMOVED******REMOVED*** (.+) ***REMOVED******REMOVED******REMOVED***$")
    sections: dict[str, list[str]] ***REMOVED*** {}
    current: str | None ***REMOVED*** None

    for line in raw.splitlines():
        row ***REMOVED*** line.rstrip("\n")
        match ***REMOVED*** section_re.match(row.strip())
        if match:
            current ***REMOVED*** match.group(1)
            sections[current] ***REMOVED*** []
            continue
        if current is not None:
            sections[current].append(row)

    return sections


def parse_int(value: str | None) -> int | None:
    if not value:
        return None
    value ***REMOVED*** value.strip()
    return int(value) if value.isdigit() else None


def parse_positive_int(value: str | None, default: int) -> int:
    try:
        parsed ***REMOVED*** int(value or "")
    except (TypeError, ValueError):
        return default
    return parsed if parsed > 0 else default


def parse_key_values(rows: list[str]) -> dict[str, str]:
    values: dict[str, str] ***REMOVED*** {}
    for row in rows:
        if "***REMOVED***" not in row:
            continue
        key, value ***REMOVED*** row.split("***REMOVED***", 1)
        values[key.strip()] ***REMOVED*** value.strip()
    return values


def blank_parsed() -> dict[str, Any]:
    return {
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


def parse_windows_status_output(raw: str) -> dict[str, Any]:
    sections ***REMOVED*** parse_sections(raw)
    parsed ***REMOVED*** blank_parsed()

    guardian_rows ***REMOVED*** sections.get("Windows Guardian", [])
    guardian_line ***REMOVED*** next(
        (x.strip() for x in guardian_rows if x.strip().startswith("Awake guardian:")),
        "",
    )
    parsed["guardian"]["raw"] ***REMOVED*** "\n".join(guardian_rows).strip()
    if guardian_line:
        parsed["guardian"]["raw"] ***REMOVED*** guardian_line
        if "STOPPED" in guardian_line:
            parsed["guardian"]["state"] ***REMOVED*** "stopped"
        elif "RUNNING" in guardian_line:
            parsed["guardian"]["state"] ***REMOVED*** "running"
            pid_match ***REMOVED*** re.search(r"PID (\d+)", guardian_line)
            parsed["guardian"]["pid"] ***REMOVED*** int(pid_match.group(1)) if pid_match else None

    autostart_rows ***REMOVED*** sections.get("Windows Autostart Task", [])
    autostart_line ***REMOVED*** next(
        (x.strip() for x in autostart_rows if x.strip().startswith("Autostart:")),
        "",
    )
    parsed["autostart"]["raw"] ***REMOVED*** "\n".join(autostart_rows).strip()
    if autostart_line:
        parsed["autostart"]["raw"] ***REMOVED*** autostart_line
        if "NOT CONFIGURED" in autostart_line:
            parsed["autostart"]["state"] ***REMOVED*** "not_configured"
        elif "CONFIGURED" in autostart_line:
            parsed["autostart"]["state"] ***REMOVED*** "configured"

    daemon_rows ***REMOVED*** sections.get("WSL Daemon (systemd --user)", [])
    parsed["daemon"]["raw"] ***REMOVED*** "\n".join(daemon_rows).strip()
    daemon_compact ***REMOVED*** [x.strip() for x in daemon_rows if x.strip()]
    if daemon_compact:
        first ***REMOVED*** daemon_compact[0]
        lowered ***REMOVED*** first.lower()
        if "not installed" in lowered:
            parsed["daemon"]["state"] ***REMOVED*** "not_installed"
        elif first ***REMOVED******REMOVED*** "active":
            parsed["daemon"]["state"] ***REMOVED*** "active"
        elif first in {"inactive", "activating", "failed"}:
            parsed["daemon"]["state"] ***REMOVED*** "inactive"
        for row in daemon_compact:
            if row.startswith("MainPID***REMOVED***"):
                parsed["daemon"]["mainPid"] ***REMOVED*** parse_int(row.split("***REMOVED***", 1)[1])
            elif row.startswith("ActiveState***REMOVED***"):
                parsed["daemon"]["activeState"] ***REMOVED*** row.split("***REMOVED***", 1)[1].strip()
            elif row.startswith("SubState***REMOVED***"):
                parsed["daemon"]["subState"] ***REMOVED*** row.split("***REMOVED***", 1)[1].strip()

    loop_rows ***REMOVED*** sections.get("Loop Status (scripts/core/monitor.sh)", [])
    if not loop_rows:
        loop_rows ***REMOVED*** sections.get("Loop Status (monitor.sh)", [])
    loop_status_rows ***REMOVED*** sections.get("Auto Company Status", [])
    merged_loop_rows ***REMOVED*** list(loop_rows) + list(loop_status_rows)
    parsed["loop"]["raw"] ***REMOVED*** "\n".join(merged_loop_rows).strip()
    for row in (x.strip() for x in merged_loop_rows if x.strip()):
        if row.startswith("Loop:"):
            if "NOT RUNNING" in row or "STOPPED" in row:
                parsed["loop"]["state"] ***REMOVED*** "stopped"
                parsed["loop"]["pid"] ***REMOVED*** None
            elif "RUNNING" in row:
                parsed["loop"]["state"] ***REMOVED*** "running"
                pid_match ***REMOVED*** re.search(r"PID (\d+)", row)
                parsed["loop"]["pid"] ***REMOVED*** int(pid_match.group(1)) if pid_match else None
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

    parsed["consensusPreview"] ***REMOVED*** "\n".join(sections.get("Latest Consensus", [])).strip()
    parsed["recentLog"] ***REMOVED*** "\n".join(sections.get("Recent Log", [])).strip()
    return parsed


def parse_macos_status_output(raw: str) -> dict[str, Any]:
    sections ***REMOVED*** parse_sections(raw)
    parsed ***REMOVED*** blank_parsed()

    guardian_fields ***REMOVED*** parse_key_values(sections.get("Guardian", []))
    parsed["guardian"]["state"] ***REMOVED*** guardian_fields.get("State", "unknown") or "unknown"
    parsed["guardian"]["pid"] ***REMOVED*** parse_int(guardian_fields.get("Pid"))
    parsed["guardian"]["raw"] ***REMOVED*** guardian_fields.get("Raw", "")

    daemon_fields ***REMOVED*** parse_key_values(sections.get("Daemon", []))
    daemon_state ***REMOVED*** daemon_fields.get("State", "unknown") or "unknown"
    parsed["daemon"]["state"] ***REMOVED*** daemon_state
    parsed["daemon"]["mainPid"] ***REMOVED*** parse_int(daemon_fields.get("MainPID"))
    parsed["daemon"]["raw"] ***REMOVED*** daemon_fields.get("Raw", "")
    parsed["daemon"]["activeState"] ***REMOVED*** daemon_fields.get("ActiveState", daemon_state)
    parsed["daemon"]["subState"] ***REMOVED*** daemon_fields.get("SubState", "unknown")

    autostart_fields ***REMOVED*** parse_key_values(sections.get("Autostart", []))
    parsed["autostart"]["state"] ***REMOVED*** autostart_fields.get("State", "unknown") or "unknown"
    parsed["autostart"]["raw"] ***REMOVED*** autostart_fields.get("Raw", "")

    loop_fields ***REMOVED*** parse_key_values(sections.get("Loop", []))
    parsed["loop"]["state"] ***REMOVED*** loop_fields.get("State", "unknown") or "unknown"
    parsed["loop"]["pid"] ***REMOVED*** parse_int(loop_fields.get("Pid"))
    parsed["loop"]["raw"] ***REMOVED*** "\n".join(sections.get("Loop", [])).strip()
    parsed["loop"]["daemonSummary"] ***REMOVED*** loop_fields.get("DaemonSummary", "unknown")

    state_file_fields ***REMOVED*** parse_key_values(sections.get("State File", []))
    parsed["loop"]["engine"] ***REMOVED*** state_file_fields.get("ENGINE", "")
    parsed["loop"]["model"] ***REMOVED*** state_file_fields.get("MODEL", "")
    parsed["loop"]["lastRun"] ***REMOVED*** state_file_fields.get("LAST_RUN", "")
    parsed["loop"]["errorCount"] ***REMOVED*** state_file_fields.get("ERROR_COUNT", "")
    parsed["loop"]["loopCount"] ***REMOVED*** state_file_fields.get("LOOP_COUNT", "")

    parsed["consensusPreview"] ***REMOVED*** "\n".join(sections.get("Latest Consensus", [])).strip()
    parsed["recentLog"] ***REMOVED*** "\n".join(sections.get("Recent Log", [])).strip()
    return parsed


def read_state_file_pairs() -> dict[str, str]:
    state_text ***REMOVED*** read_text_file(STATE_FILE, "").strip()
    state_pairs: dict[str, str] ***REMOVED*** {}
    if state_text:
        for row in state_text.splitlines():
            if "***REMOVED***" in row:
                key, value ***REMOVED*** row.split("***REMOVED***", 1)
                state_pairs[key.strip()] ***REMOVED*** value.strip()
    return state_pairs


def run_status_command(system_name: str | None ***REMOVED*** None) -> dict[str, Any]:
    profile ***REMOVED*** get_host_profile(system_name)
    runner ***REMOVED*** profile["runner"]
    return runner(profile["status_script"], timeout***REMOVED***90)


def run_dashboard_action(action: str, system_name: str | None ***REMOVED*** None) -> dict[str, Any]:
    profile ***REMOVED*** get_host_profile(system_name)
    if action ***REMOVED******REMOVED*** "start":
        return profile["runner"](
            profile["start_script"], args***REMOVED***profile["start_args"], timeout***REMOVED***120
        )
    if action ***REMOVED******REMOVED*** "stop":
        return profile["runner"](
            profile["stop_script"], args***REMOVED***profile["stop_args"], timeout***REMOVED***120
        )
    if action ***REMOVED******REMOVED*** "refresh":
        return profile["runner"](profile["status_script"], timeout***REMOVED***90)
    raise ValueError(f"Unsupported dashboard action: {action}")


def parse_status_output(raw: str, system_name: str | None ***REMOVED*** None) -> dict[str, Any]:
    profile ***REMOVED*** get_host_profile(system_name)
    return profile["parser"](raw)


def gather_status_payload(system_name: str | None ***REMOVED*** None) -> dict[str, Any]:
    result ***REMOVED*** run_status_command(system_name)
    parsed ***REMOVED*** parse_status_output(result["output"], system_name)
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ok": result["ok"],
        "exitCode": result["exitCode"],
        "elapsedMs": result["elapsedMs"],
        "raw": result["output"],
        "parsed": parsed,
        "stateFile": read_state_file_pairs(),
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

    def _text(
        self, text: str, code: int ***REMOVED*** 200, content_type: str ***REMOVED*** "text/plain; charset***REMOVED***utf-8"
    ) -> None:
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
            self._serve_file(
                DASHBOARD_DIR / "app.js",
                "application/javascript; charset***REMOVED***utf-8",
            )
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
            lines ***REMOVED*** parse_positive_int(qs.get("lines", ["180"])[0], default***REMOVED***180)
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

        action ***REMOVED*** path.rsplit("/", 1)[-1]
        result ***REMOVED*** run_dashboard_action(action)
        payload ***REMOVED*** {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": action,
            "ok": result["ok"],
            "exitCode": result["exitCode"],
            "elapsedMs": result["elapsedMs"],
            "output": result["output"],
        }
        self._json(payload, code***REMOVED***HTTPStatus.OK if result["ok"] else HTTPStatus.BAD_REQUEST)

    def log_message(self, fmt: str, *args: Any) -> None:  # noqa: A003
        _ ***REMOVED*** (fmt, args)


def main() -> None:
    parser ***REMOVED*** argparse.ArgumentParser(description***REMOVED***"Auto Company web dashboard server")
    parser.add_argument("--host", default***REMOVED***"127.0.0.1")
    parser.add_argument("--port", type***REMOVED***int, default***REMOVED***8787)
    args ***REMOVED*** parser.parse_args()

    try:
        host_kind ***REMOVED*** detect_host_kind()
    except RuntimeError as exc:
        print(f"[dashboard] {exc}")
        raise SystemExit(1) from exc

    server ***REMOVED*** ThreadingHTTPServer((args.host, args.port), DashboardHandler)
    print(f"[dashboard] serving on http://{args.host}:{args.port}")
    print(f"[dashboard] repo: {REPO_ROOT}")
    print(f"[dashboard] host: {host_kind}")
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
