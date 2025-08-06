#!/usr/bin/env python3
"""
HTML Report Verification Script
Validates that HTML reports are properly generated with all sections from MD
"""

import argparse
import re
from pathlib import Path
from typing import List, Tuple


class HTMLVerifier:
    """Verify HTML research reports"""

    def __init__(self, html_path: Path, md_path: Path):
        self.html_path ***REMOVED*** html_path
        self.md_path ***REMOVED*** md_path
        self.errors ***REMOVED*** []
        self.warnings ***REMOVED*** []

    def verify(self) -> bool:
        """
        Run all verification checks

        Returns:
            True if all checks pass, False otherwise
        """
        print(f"\n{'***REMOVED***'*60}")
        print(f"HTML REPORT VERIFICATION")
        print(f"{'***REMOVED***'*60}\n")

        print(f"HTML File: {self.html_path}")
        print(f"MD File: {self.md_path}\n")

        # Read files
        try:
            html_content ***REMOVED*** self.html_path.read_text()
            md_content ***REMOVED*** self.md_path.read_text()
        except Exception as e:
            self.errors.append(f"Failed to read files: {e}")
            return False

        # Run checks
        self._check_sections(html_content, md_content)
        self._check_no_placeholders(html_content)
        self._check_no_emojis(html_content)
        self._check_structure(html_content)
        self._check_citations(html_content, md_content)
        self._check_bibliography(html_content, md_content)

        # Report results
        self._print_results()

        return len(self.errors) ***REMOVED******REMOVED*** 0

    def _check_sections(self, html: str, md: str):
        """Verify all markdown sections are present in HTML"""
        # Extract section headings from markdown
        md_sections ***REMOVED*** re.findall(r'^## (.+)$', md, re.MULTILINE)

        # Extract sections from HTML
        html_sections ***REMOVED*** re.findall(r'<h2 class***REMOVED***"section-title">(.+?)</h2>', html)

        # Check if we have placeholder sections like <div class***REMOVED***"section">#</div>
        placeholder_sections ***REMOVED*** re.findall(r'<div class***REMOVED***"section">#</div>', html)

        if placeholder_sections:
            self.errors.append(
                f"Found {len(placeholder_sections)} placeholder sections (empty '#' divs) - content not converted properly"
            )

        # Compare section counts
        if len(md_sections) > len(html_sections) + 1:  # +1 for bibliography which is separate
            self.errors.append(
                f"Section count mismatch: MD has {len(md_sections)} sections, HTML has only {len(html_sections)} + bibliography"
            )
            missing ***REMOVED*** set(md_sections) - set(html_sections)
            if missing:
                self.errors.append(f"Missing sections in HTML: {missing}")

        # Verify Executive Summary is present
        if "Executive Summary" in md and "Executive Summary" not in html:
            self.errors.append("Executive Summary missing from HTML")

    def _check_no_placeholders(self, html: str):
        """Check for common placeholders that shouldn't be in final report"""
        placeholders ***REMOVED*** [
            '{{TITLE}}', '{{DATE}}', '{{CONTENT}}', '{{BIBLIOGRAPHY}}',
            '{{METRICS_DASHBOARD}}', '{{SOURCE_COUNT}}', 'TODO', 'TBD',
            'PLACEHOLDER', 'FIXME'
        ]

        found ***REMOVED*** []
        for placeholder in placeholders:
            if placeholder in html:
                found.append(placeholder)

        if found:
            self.errors.append(f"Found unreplaced placeholders: {', '.join(found)}")

    def _check_no_emojis(self, html: str):
        """Verify no emojis are present in HTML"""
        # Common emoji patterns
        emoji_pattern ***REMOVED*** re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map symbols
            "\U0001F1E0-\U0001F1FF"  # flags
