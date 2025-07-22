#!/usr/bin/env python3
"""
Report Validation Script
Ensures research reports meet quality standards before delivery
"""

import argparse
import re
import sys
from pathlib import Path
from typing import List, Tuple, Dict


class ReportValidator:
    """Validates research report quality"""

    def __init__(self, report_path: Path):
        self.report_path ***REMOVED*** report_path
        self.content ***REMOVED*** self._read_report()
        self.errors: List[str] ***REMOVED*** []
        self.warnings: List[str] ***REMOVED*** []

    def _read_report(self) -> str:
        """Read report file"""
        try:
            with open(self.report_path, 'r', encoding***REMOVED***'utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"❌ ERROR: Cannot read report: {e}")
            sys.exit(1)

    def validate(self) -> bool:
        """Run all validation checks"""
        print(f"\n{'***REMOVED***'*60}")
        print(f"VALIDATING REPORT: {self.report_path.name}")
        print(f"{'***REMOVED***'*60}\n")

        checks ***REMOVED*** [
            ("Executive Summary", self._check_executive_summary),
            ("Required Sections", self._check_required_sections),
            ("Citations", self._check_citations),
            ("Bibliography", self._check_bibliography),
            ("Placeholder Text", self._check_placeholders),
            ("Content Truncation", self._check_content_truncation),
            ("Word Count", self._check_word_count),
            ("Source Count", self._check_source_count),
            ("Broken Links", self._check_broken_references),
        ]

        for check_name, check_func in checks:
            print(f"⏳ Checking: {check_name}...", end***REMOVED***" ")
            passed ***REMOVED*** check_func()
            if passed:
                print("✅ PASS")
            else:
                print("❌ FAIL")

        self._print_summary()

        return len(self.errors) ***REMOVED******REMOVED*** 0

    def _check_executive_summary(self) -> bool:
        """Check executive summary exists and is under 250 words"""
        pattern ***REMOVED*** r'## Executive Summary(.*?)(?***REMOVED***##|\Z)'
        match ***REMOVED*** re.search(pattern, self.content, re.DOTALL | re.IGNORECASE)

        if not match:
            self.errors.append("Missing 'Executive Summary' section")
            return False

        summary ***REMOVED*** match.group(1).strip()
        word_count ***REMOVED*** len(summary.split())

        if word_count > 250:
            self.warnings.append(f"Executive summary too long: {word_count} words (should be ≤250)")

        if word_count < 50:
            self.warnings.append(f"Executive summary too short: {word_count} words (should be ≥50)")

        return True

    def _check_required_sections(self) -> bool:
        """Check all required sections are present"""
        required ***REMOVED*** [
            "Executive Summary",
            "Introduction",
            "Main Analysis",
            "Synthesis",
            "Limitations",
            "Recommendations",
            "Bibliography",
            "Methodology"
        ]

        # Recommended sections (warnings if missing, not errors)
        recommended ***REMOVED*** [
            "Counterevidence Register",
            "Claims-Evidence Table"
        ]

        missing ***REMOVED*** []
        for section in required:
            if not re.search(rf'##.*{section}', self.content, re.IGNORECASE):
                missing.append(section)

        if missing:
            self.errors.append(f"Missing sections: {', '.join(missing)}")
            return False

        # Check recommended sections (warnings only)
        missing_recommended ***REMOVED*** []
        for section in recommended:
            if not re.search(rf'##.*{section}', self.content, re.IGNORECASE):
                missing_recommended.append(section)

        if missing_recommended:
            self.warnings.append(f"Missing recommended sections (for academic rigor): {', '.join(missing_recommended)}")

