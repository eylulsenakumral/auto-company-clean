#!/usr/bin/env python3
"""
security-scan.py — AST-based security scanner for common Python vulnerability patterns.

Scans Python source files for:
  - eval() / exec() / compile() calls
  - subprocess with shell***REMOVED***True
  - pickle.loads() on potentially untrusted data
  - Raw SQL string construction (f-strings with SELECT/INSERT/UPDATE/DELETE)
  - yaml.load() without SafeLoader
  - Hardcoded secret patterns (API keys, passwords in source)
  - Weak hash functions (MD5, SHA1 for passwords)
  - os.system() calls

Usage:
  python security-scan.py --path ./app --output-dir ./security-results
  python security-scan.py --path ./app --output-dir ./results --severity high

Options:
  --path         Directory or file to scan (required)
  --output-dir   Directory to write JSON results (default: ./security-results)
  --severity     Minimum severity to report: critical, high, medium, low (default: low)
"""

import argparse
import ast
import json
import os
import re
import sys
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


# ─── Data Structures ─────────────────────────────────────────────────────────────

SEVERITY_ORDER ***REMOVED*** {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}


@dataclass
class Finding:
    """A single security finding."""
    rule_id: str
    severity: str
    category: str
    message: str
    file: str
    line: int
    col: int
    snippet: str
    cwe: Optional[str] ***REMOVED*** None


# ─── AST-Based Rules ─────────────────────────────────────────────────────────────

class SecurityVisitor(ast.NodeVisitor):
    """AST visitor that checks for common security anti-patterns."""

    def __init__(self, filepath: str, source_lines: list[str]):
        self.filepath ***REMOVED*** filepath
        self.source_lines ***REMOVED*** source_lines
        self.findings: list[Finding] ***REMOVED*** []

    def _get_snippet(self, lineno: int) -> str:
        """Get the source line for a finding."""
        if 1 <***REMOVED*** lineno <***REMOVED*** len(self.source_lines):
            return self.source_lines[lineno - 1].strip()
        return ""

    def _add_finding(
        self,
        rule_id: str,
        severity: str,
        category: str,
        message: str,
        node: ast.AST,
        cwe: Optional[str] ***REMOVED*** None,
    ):
        self.findings.append(Finding(
            rule_id***REMOVED***rule_id,
            severity***REMOVED***severity,
            category***REMOVED***category,
            message***REMOVED***message,
            file***REMOVED***self.filepath,
            line***REMOVED***getattr(node, "lineno", 0),
            col***REMOVED***getattr(node, "col_offset", 0),
            snippet***REMOVED***self._get_snippet(getattr(node, "lineno", 0)),
            cwe***REMOVED***cwe,
        ))

    def visit_Call(self, node: ast.Call):
        """Check function calls for dangerous patterns."""
        func_name ***REMOVED*** self._get_func_name(node)

        # Rule: eval / exec / compile
        if func_name in ("eval", "exec", "compile"):
            self._add_finding(
                rule_id***REMOVED***"SEC001",
                severity***REMOVED***"critical",
                category***REMOVED***"OWASP A03: Injection",
                message***REMOVED***f"Use of {func_name}() can lead to code execution. "
                        f"Remove or use ast.literal_eval() for safe parsing.",
                node***REMOVED***node,
                cwe***REMOVED***"CWE-95",
            )

        # Rule: pickle.loads / pickle.load
        if func_name in ("pickle.loads", "pickle.load"):
            self._add_finding(
                rule_id***REMOVED***"SEC002",
                severity***REMOVED***"critical",
                category***REMOVED***"OWASP A08: Software and Data Integrity",
                message***REMOVED***"pickle.loads() can execute arbitrary code on untrusted data. "
                        "Use JSON or msgpack for deserialization.",
                node***REMOVED***node,
                cwe***REMOVED***"CWE-502",
            )

        # Rule: os.system
        if func_name ***REMOVED******REMOVED*** "os.system":
            self._add_finding(
                rule_id***REMOVED***"SEC003",
                severity***REMOVED***"high",
                category***REMOVED***"OWASP A03: Injection",
                message***REMOVED***"os.system() is vulnerable to command injection. "
                        "Use subprocess.run([...], shell***REMOVED***False) instead.",
                node***REMOVED***node,
                cwe***REMOVED***"CWE-78",
            )

        # Rule: subprocess with shell***REMOVED***True
        if func_name in ("subprocess.run", "subprocess.call", "subprocess.Popen",
                         "subprocess.check_output", "subprocess.check_call"):
            for kw in node.keywords:
                if kw.arg ***REMOVED******REMOVED*** "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True:
                    self._add_finding(
                        rule_id***REMOVED***"SEC004",
                        severity***REMOVED***"high",
                        category***REMOVED***"OWASP A03: Injection",
                        message***REMOVED***f"{func_name}() with shell***REMOVED***True is vulnerable to "
                                f"command injection. Use shell***REMOVED***False and pass args as a list.",
                        node***REMOVED***node,
                        cwe***REMOVED***"CWE-78",
                    )

        # Rule: yaml.load without SafeLoader
        if func_name ***REMOVED******REMOVED*** "yaml.load":
            has_safe_loader ***REMOVED*** False
            for kw in node.keywords:
                if kw.arg ***REMOVED******REMOVED*** "Loader":
                    if isinstance(kw.value, ast.Attribute) and "Safe" in kw.value.attr:
                        has_safe_loader ***REMOVED*** True
                    elif isinstance(kw.value, ast.Name) and "Safe" in kw.value.id:
                        has_safe_loader ***REMOVED*** True
            if not has_safe_loader:
                self._add_finding(
                    rule_id***REMOVED***"SEC005",
                    severity***REMOVED***"high",
                    category***REMOVED***"OWASP A08: Software and Data Integrity",
                    message***REMOVED***"yaml.load() without SafeLoader can execute arbitrary code. "
                            "Use yaml.safe_load() or yaml.load(data, Loader***REMOVED***yaml.SafeLoader).",
                    node***REMOVED***node,
                    cwe***REMOVED***"CWE-502",
                )

        # Rule: hashlib.md5 / hashlib.sha1 (potential password hashing)
        if func_name in ("hashlib.md5", "hashlib.sha1"):
            self._add_finding(
                rule_id***REMOVED***"SEC006",
                severity***REMOVED***"medium",
                category***REMOVED***"OWASP A02: Cryptographic Failures",
                message***REMOVED***f"{func_name}() is a weak hash function. "
                        f"If used for passwords, switch to bcrypt via passlib.",
                node***REMOVED***node,
                cwe***REMOVED***"CWE-328",
            )

        self.generic_visit(node)

    def visit_JoinedStr(self, node: ast.JoinedStr):
        """Check f-strings for potential SQL injection."""
        # Reconstruct the f-string content to check for SQL keywords
        string_parts ***REMOVED*** []
        for value in node.values:
            if isinstance(value, ast.Constant):
                string_parts.append(str(value.value))

        full_text ***REMOVED*** " ".join(string_parts).upper()
        sql_keywords ***REMOVED*** ["SELECT ", "INSERT ", "UPDATE ", "DELETE ", "DROP ", "ALTER "]

        if any(kw in full_text for kw in sql_keywords):
            self._add_finding(
                rule_id***REMOVED***"SEC007",
                severity***REMOVED***"critical",
                category***REMOVED***"OWASP A03: Injection",
                message***REMOVED***"SQL query constructed with f-string interpolation. "
                        "This is vulnerable to SQL injection. Use parameterized queries.",
                node***REMOVED***node,
                cwe***REMOVED***"CWE-89",
            )

        self.generic_visit(node)

    def _get_func_name(self, node: ast.Call) -> str:
        """Extract the function name from a Call node."""
        if isinstance(node.func, ast.Name):
            return node.func.id
        elif isinstance(node.func, ast.Attribute):
            parts ***REMOVED*** []
            current ***REMOVED*** node.func
            while isinstance(current, ast.Attribute):
                parts.append(current.attr)
                current ***REMOVED*** current.value
            if isinstance(current, ast.Name):
                parts.append(current.id)
            return ".".join(reversed(parts))
        return ""


# ─── Regex-Based Rules (for patterns AST cannot catch) ────────────────────────

REGEX_RULES ***REMOVED*** [
    {
        "rule_id": "SEC008",
        "severity": "high",
        "category": "OWASP A02: Cryptographic Failures",
        "message": "Potential hardcoded secret detected. Move secrets to environment variables.",
        "cwe": "CWE-798",
        "pattern": re.compile(
            r"""(?:SECRET_KEY|API_KEY|PASSWORD|TOKEN|PRIVATE_KEY)\s****REMOVED***\s*['"][^'"]{8,}['"]""",
            re.IGNORECASE,
        ),
    },
    {
        "rule_id": "SEC009",
        "severity": "medium",
        "category": "OWASP A09: Security Logging and Monitoring",
        "message": "Potential sensitive data in log statement. Ensure passwords, tokens, "
                   "and PII are not logged.",
        "cwe": "CWE-532",
        "pattern": re.compile(
            r"""(?:logger?\.|logging\.)(?:info|debug|warning|error)\(.*(?:password|token|secret|api_key)""",
            re.IGNORECASE,
        ),
    },
    {
        "rule_id": "SEC010",
        "severity": "medium",
        "category": "OWASP A07: Identification and Authentication",
        "message": "JWT decode with signature verification disabled. Always verify JWT signatures.",
        "cwe": "CWE-347",
        "pattern": re.compile(
            r"""jwt\.decode\(.*verify_signature.*False""",
            re.IGNORECASE,
        ),
    },
]


def regex_scan(filepath: str, source: str) -> list[Finding]:
    """Apply regex-based rules to source code."""
    findings ***REMOVED*** []
    lines ***REMOVED*** source.split("\n")
    for rule in REGEX_RULES:
        for i, line in enumerate(lines, start***REMOVED***1):
            if rule["pattern"].search(line):
                findings.append(Finding(
                    rule_id***REMOVED***rule["rule_id"],
                    severity***REMOVED***rule["severity"],
                    category***REMOVED***rule["category"],
                    message***REMOVED***rule["message"],
                    file***REMOVED***filepath,
                    line***REMOVED***i,
                    col***REMOVED***0,
                    snippet***REMOVED***line.strip(),
                    cwe***REMOVED***rule.get("cwe"),
                ))
    return findings


# ─── Scanner ──────────────────────────────────────────────────────────────────

def scan_file(filepath: str) -> list[Finding]:
    """Scan a single Python file for security issues."""
    try:
        source ***REMOVED*** Path(filepath).read_text(encoding***REMOVED***"utf-8")
    except (OSError, UnicodeDecodeError) as e:
        print(f"WARNING: Could not read {filepath}: {e}", file***REMOVED***sys.stderr)
        return []

    findings ***REMOVED*** []

    # AST-based scan
    try:
        tree ***REMOVED*** ast.parse(source, filename***REMOVED***filepath)
        visitor ***REMOVED*** SecurityVisitor(filepath, source.split("\n"))
        visitor.visit(tree)
        findings.extend(visitor.findings)
    except SyntaxError as e:
        print(f"WARNING: Syntax error in {filepath}: {e}", file***REMOVED***sys.stderr)

    # Regex-based scan
    findings.extend(regex_scan(filepath, source))

    return findings


def scan_directory(path: str) -> list[Finding]:
    """Recursively scan a directory for Python files."""
    findings ***REMOVED*** []
    scan_path ***REMOVED*** Path(path)

    if scan_path.is_file():
        if scan_path.suffix ***REMOVED******REMOVED*** ".py":
            return scan_file(str(scan_path))
        return []

    for py_file in scan_path.rglob("*.py"):
        # Skip common non-application directories
        skip_dirs ***REMOVED*** {"__pycache__", ".venv", "venv", "node_modules", ".git", "migrations"}
        if any(part in skip_dirs for part in py_file.parts):
            continue
        findings.extend(scan_file(str(py_file)))

    return findings


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser ***REMOVED*** argparse.ArgumentParser(
        description***REMOVED***"AST-based security scanner for Python code.",
    )
    parser.add_argument(
        "--path",
        required***REMOVED***True,
        help***REMOVED***"Directory or file to scan",
    )
    parser.add_argument(
        "--output-dir",
        default***REMOVED***"./security-results",
        help***REMOVED***"Directory to write JSON results (default: ./security-results)",
    )
    parser.add_argument(
        "--severity",
        default***REMOVED***"low",
        choices***REMOVED***["critical", "high", "medium", "low", "info"],
        help***REMOVED***"Minimum severity to report (default: low)",
    )
    args ***REMOVED*** parser.parse_args()

    # Validate path
    if not Path(args.path).exists():
        print(f"ERROR: Path does not exist: {args.path}", file***REMOVED***sys.stderr)
        sys.exit(1)

    # Scan
    print(f"Scanning: {args.path}")
    all_findings ***REMOVED*** scan_directory(args.path)

    # Filter by severity
    min_severity ***REMOVED*** SEVERITY_ORDER.get(args.severity, 3)
    findings ***REMOVED*** [f for f in all_findings if SEVERITY_ORDER.get(f.severity, 4) <***REMOVED*** min_severity]

    # Sort by severity (critical first), then by file and line
    findings.sort(key***REMOVED***lambda f: (SEVERITY_ORDER.get(f.severity, 4), f.file, f.line))

    # Write results
    output_dir ***REMOVED*** Path(args.output_dir)
    output_dir.mkdir(parents***REMOVED***True, exist_ok***REMOVED***True)
    timestamp ***REMOVED*** datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    output_file ***REMOVED*** output_dir / f"security-scan-{timestamp}.json"

    report ***REMOVED*** {
        "scan_timestamp": datetime.now(timezone.utc).isoformat(),
        "scanned_path": str(Path(args.path).resolve()),
        "min_severity": args.severity,
        "total_findings": len(findings),
        "by_severity": {
            sev: len([f for f in findings if f.severity ***REMOVED******REMOVED*** sev])
            for sev in ["critical", "high", "medium", "low", "info"]
        },
        "findings": [asdict(f) for f in findings],
    }

    output_file.write_text(json.dumps(report, indent***REMOVED***2), encoding***REMOVED***"utf-8")
    print(f"Results written to: {output_file}")

    # Console summary
    print(f"\n{'***REMOVED***'*60}")
    print(f"Security Scan Results")
    print(f"{'***REMOVED***'*60}")
    print(f"Files scanned:    {args.path}")
    print(f"Total findings:   {len(findings)}")
    for sev in ["critical", "high", "medium", "low"]:
        count ***REMOVED*** report["by_severity"][sev]
        if count > 0:
            print(f"  {sev.upper():12s}  {count}")
    print(f"{'***REMOVED***'*60}")

    if findings:
        print("\nFindings:\n")
        for f in findings:
            print(f"  [{f.severity.upper()}] {f.rule_id}: {f.message}")
            print(f"    File: {f.file}:{f.line}")
            print(f"    Code: {f.snippet}")
            if f.cwe:
                print(f"    CWE:  {f.cwe}")
            print()

    # Exit code: non-zero if critical or high findings exist
    critical_high ***REMOVED*** report["by_severity"]["critical"] + report["by_severity"]["high"]
    if critical_high > 0:
        print(f"FAIL: {critical_high} critical/high severity findings detected.")
        sys.exit(1)
    else:
        print("PASS: No critical or high severity findings.")
        sys.exit(0)


if __name__ ***REMOVED******REMOVED*** "__main__":
    main()
