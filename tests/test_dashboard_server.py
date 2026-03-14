import importlib.util
import unittest
from pathlib import Path
from unittest import mock


SERVER_PATH ***REMOVED*** Path(__file__).resolve().parents[1] / "dashboard" / "server.py"
SPEC ***REMOVED*** importlib.util.spec_from_file_location("dashboard_server", SERVER_PATH)
assert SPEC is not None
assert SPEC.loader is not None
dashboard_server ***REMOVED*** importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(dashboard_server)


class DashboardServerTests(unittest.TestCase):
    def test_windows_not_running_maps_to_stopped(self) -> None:
        raw ***REMOVED*** """***REMOVED******REMOVED******REMOVED*** Windows Guardian ***REMOVED******REMOVED******REMOVED***
Awake guardian: STOPPED

***REMOVED******REMOVED******REMOVED*** Windows Autostart Task ***REMOVED******REMOVED******REMOVED***
Autostart: NOT CONFIGURED

***REMOVED******REMOVED******REMOVED*** WSL Daemon (systemd --user) ***REMOVED******REMOVED******REMOVED***
active
MainPID***REMOVED***321
ActiveState***REMOVED***active
SubState***REMOVED***running

***REMOVED******REMOVED******REMOVED*** Auto Company Status ***REMOVED******REMOVED******REMOVED***
Loop: NOT RUNNING
Daemon: ACTIVE (systemd --user auto-company.service)
ENGINE***REMOVED***claude
MODEL***REMOVED***sonnet
"""
        parsed ***REMOVED*** dashboard_server.parse_status_output(raw, system_name***REMOVED***"Windows")
        self.assertEqual(parsed["guardian"]["state"], "stopped")
        self.assertEqual(parsed["autostart"]["state"], "not_configured")
        self.assertEqual(parsed["daemon"]["state"], "active")
        self.assertEqual(parsed["loop"]["state"], "stopped")
        self.assertIsNone(parsed["loop"]["pid"])

    def test_windows_not_installed_daemon_maps_correctly(self) -> None:
        raw ***REMOVED*** """***REMOVED******REMOVED******REMOVED*** Windows Guardian ***REMOVED******REMOVED******REMOVED***
Awake guardian: RUNNING (PID 45)

***REMOVED******REMOVED******REMOVED*** Windows Autostart Task ***REMOVED******REMOVED******REMOVED***
Autostart: CONFIGURED (AutoCompany-WSL-Start)

***REMOVED******REMOVED******REMOVED*** WSL Daemon (systemd --user) ***REMOVED******REMOVED******REMOVED***
auto-company.service: not installed

***REMOVED******REMOVED******REMOVED*** Auto Company Status ***REMOVED******REMOVED******REMOVED***
Loop: RUNNING (PID 77)
Daemon: NOT INSTALLED (systemd --user auto-company.service)
"""
        parsed ***REMOVED*** dashboard_server.parse_status_output(raw, system_name***REMOVED***"Windows")
        self.assertEqual(parsed["guardian"]["state"], "running")
        self.assertEqual(parsed["guardian"]["pid"], 45)
        self.assertEqual(parsed["autostart"]["state"], "configured")
        self.assertEqual(parsed["daemon"]["state"], "not_installed")
        self.assertEqual(parsed["loop"]["state"], "running")
        self.assertEqual(parsed["loop"]["pid"], 77)

    def test_macos_active_configured_running_maps_correctly(self) -> None:
        raw ***REMOVED*** """***REMOVED******REMOVED******REMOVED*** Guardian ***REMOVED******REMOVED******REMOVED***
State***REMOVED***running
Pid***REMOVED***111
Raw***REMOVED***caffeinate -w 456

***REMOVED******REMOVED******REMOVED*** Daemon ***REMOVED******REMOVED******REMOVED***
State***REMOVED***active
MainPID***REMOVED***222
Raw***REMOVED***launchd agent loaded

***REMOVED******REMOVED******REMOVED*** Autostart ***REMOVED******REMOVED******REMOVED***
State***REMOVED***configured
Raw***REMOVED***LaunchAgent plist present

***REMOVED******REMOVED******REMOVED*** Loop ***REMOVED******REMOVED******REMOVED***
State***REMOVED***running
Pid***REMOVED***456
Raw***REMOVED***Loop running

***REMOVED******REMOVED******REMOVED*** State File ***REMOVED******REMOVED******REMOVED***
ENGINE***REMOVED***claude
MODEL***REMOVED***sonnet
LOOP_COUNT***REMOVED***9
ERROR_COUNT***REMOVED***0
LAST_RUN***REMOVED***2026-03-14 12:00:00
"""
        parsed ***REMOVED*** dashboard_server.parse_status_output(raw, system_name***REMOVED***"Darwin")
        self.assertEqual(parsed["guardian"]["state"], "running")
        self.assertEqual(parsed["guardian"]["pid"], 111)
        self.assertEqual(parsed["daemon"]["state"], "active")
        self.assertEqual(parsed["daemon"]["mainPid"], 222)
        self.assertEqual(parsed["autostart"]["state"], "configured")
        self.assertEqual(parsed["loop"]["state"], "running")
        self.assertEqual(parsed["loop"]["pid"], 456)
        self.assertEqual(parsed["loop"]["engine"], "claude")
        self.assertEqual(parsed["loop"]["loopCount"], "9")

    def test_macos_inactive_configured_stopped_and_guardian_without_caffeinate(self) -> None:
        raw ***REMOVED*** """***REMOVED******REMOVED******REMOVED*** Guardian ***REMOVED******REMOVED******REMOVED***
State***REMOVED***stopped
Raw***REMOVED***Sleep guard: loop running without caffeinate

***REMOVED******REMOVED******REMOVED*** Daemon ***REMOVED******REMOVED******REMOVED***
State***REMOVED***inactive
Raw***REMOVED***LaunchAgent paused (.auto-loop-paused present)

***REMOVED******REMOVED******REMOVED*** Autostart ***REMOVED******REMOVED******REMOVED***
State***REMOVED***configured
Raw***REMOVED***LaunchAgent plist present

***REMOVED******REMOVED******REMOVED*** Loop ***REMOVED******REMOVED******REMOVED***
State***REMOVED***stopped
Raw***REMOVED***Loop stopped (stale PID 456)
"""
        parsed ***REMOVED*** dashboard_server.parse_status_output(raw, system_name***REMOVED***"Darwin")
        self.assertEqual(parsed["guardian"]["state"], "stopped")
        self.assertEqual(parsed["daemon"]["state"], "inactive")
        self.assertEqual(parsed["autostart"]["state"], "configured")
        self.assertEqual(parsed["loop"]["state"], "stopped")

    def test_macos_not_installed_maps_correctly(self) -> None:
        raw ***REMOVED*** """***REMOVED******REMOVED******REMOVED*** Guardian ***REMOVED******REMOVED******REMOVED***
State***REMOVED***stopped
Raw***REMOVED***Sleep guard: not active

***REMOVED******REMOVED******REMOVED*** Daemon ***REMOVED******REMOVED******REMOVED***
State***REMOVED***not_installed
Raw***REMOVED***LaunchAgent plist not installed

***REMOVED******REMOVED******REMOVED*** Autostart ***REMOVED******REMOVED******REMOVED***
State***REMOVED***not_configured
Raw***REMOVED***LaunchAgent plist absent

***REMOVED******REMOVED******REMOVED*** Loop ***REMOVED******REMOVED******REMOVED***
State***REMOVED***stopped
Raw***REMOVED***Loop not running
"""
        parsed ***REMOVED*** dashboard_server.parse_status_output(raw, system_name***REMOVED***"Darwin")
        self.assertEqual(parsed["daemon"]["state"], "not_installed")
        self.assertEqual(parsed["autostart"]["state"], "not_configured")
        self.assertEqual(parsed["loop"]["state"], "stopped")

    def test_windows_start_uses_powershell_runner(self) -> None:
        with mock.patch.object(
            dashboard_server,
            "run_powershell_script",
            return_value***REMOVED***{"ok": True, "exitCode": 0, "elapsedMs": 1, "output": ""},
        ) as runner:
            result ***REMOVED*** dashboard_server.run_dashboard_action("start", system_name***REMOVED***"Windows")
        self.assertTrue(result["ok"])
        runner.assert_called_once_with(
            dashboard_server.WINDOWS_START_SCRIPT, args***REMOVED***None, timeout***REMOVED***120
        )

    def test_macos_stop_uses_shell_runner_with_pause_daemon(self) -> None:
        with mock.patch.object(
            dashboard_server,
            "run_shell_script",
            return_value***REMOVED***{"ok": True, "exitCode": 0, "elapsedMs": 1, "output": ""},
        ) as runner:
            result ***REMOVED*** dashboard_server.run_dashboard_action("stop", system_name***REMOVED***"Darwin")
        self.assertTrue(result["ok"])
        runner.assert_called_once_with(
            dashboard_server.MACOS_STOP_SCRIPT,
            args***REMOVED***["--pause-daemon"],
            timeout***REMOVED***120,
        )

    def test_refresh_uses_status_script(self) -> None:
        with mock.patch.object(
            dashboard_server,
            "run_shell_script",
            return_value***REMOVED***{"ok": True, "exitCode": 0, "elapsedMs": 1, "output": ""},
        ) as runner:
            dashboard_server.run_dashboard_action("refresh", system_name***REMOVED***"Darwin")
        runner.assert_called_once_with(
            dashboard_server.MACOS_STATUS_SCRIPT, timeout***REMOVED***90
        )

    def test_invalid_log_tail_lines_fall_back_to_default(self) -> None:
        self.assertEqual(dashboard_server.parse_positive_int("abc", default***REMOVED***180), 180)
        self.assertEqual(dashboard_server.parse_positive_int("-5", default***REMOVED***180), 180)
        self.assertEqual(dashboard_server.parse_positive_int("12", default***REMOVED***180), 12)

    def test_unsupported_host_raises(self) -> None:
        with self.assertRaisesRegex(RuntimeError, "only supports Windows hosts"):
            dashboard_server.detect_host_kind("Linux")


if __name__ ***REMOVED******REMOVED*** "__main__":
    unittest.main()
