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

        return True

    def _check_citations(self) -> bool:
        """Check citation format and presence"""
        # Find all citation references [1], [2], etc.
        citations ***REMOVED*** re.findall(r'\[(\d+)\]', self.content)

        if not citations:
            self.errors.append("No citations found in report")
            return False

        unique_citations ***REMOVED*** set(citations)

        if len(unique_citations) < 10:
            self.warnings.append(f"Only {len(unique_citations)} unique sources cited (recommended: ≥10)")

        # Check for consecutive citation numbers
        citation_nums ***REMOVED*** sorted([int(c) for c in unique_citations])
        if citation_nums:
            max_citation ***REMOVED*** max(citation_nums)
            expected ***REMOVED*** set(range(1, max_citation + 1))
            missing ***REMOVED*** expected - set(citation_nums)

            if missing:
                self.warnings.append(f"Non-consecutive citation numbers, missing: {sorted(missing)}")

        return True

    def _check_bibliography(self) -> bool:
        """Check bibliography exists, matches citations, and has no truncation placeholders"""
        pattern ***REMOVED*** r'## Bibliography(.*?)(?***REMOVED***##|\Z)'
        match ***REMOVED*** re.search(pattern, self.content, re.DOTALL | re.IGNORECASE)

        if not match:
            self.errors.append("Missing 'Bibliography' section")
            return False

        bib_section ***REMOVED*** match.group(1)

        # CRITICAL: Check for truncation placeholders (2025 CiteGuard enhancement)
        truncation_patterns ***REMOVED*** [
            (r'\[\d+-\d+\]', 'Citation range (e.g., [8-75])'),
            (r'Additional.*citations', 'Phrase "Additional citations"'),
            (r'would be included', 'Phrase "would be included"'),
            (r'\[\.\.\.continue', 'Pattern "[...continue"'),
            (r'\[Continue with', 'Pattern "[Continue with"'),
            (r'etc\.(?!\w)', 'Standalone "etc."'),
            (r'and so on', 'Phrase "and so on"'),
        ]

        for pattern_re, description in truncation_patterns:
            if re.search(pattern_re, bib_section, re.IGNORECASE):
                self.errors.append(f"⚠️ CRITICAL: Bibliography contains truncation placeholder: {description}")
                self.errors.append(f"   This makes the report UNUSABLE - complete bibliography required")
                return False

        # Count bibliography entries [1], [2], etc.
        bib_entries ***REMOVED*** re.findall(r'^\[(\d+)\]', bib_section, re.MULTILINE)

        if not bib_entries:
            self.errors.append("Bibliography has no entries")
            return False

        # Check citation number continuity (no gaps)
        bib_nums ***REMOVED*** sorted([int(n) for n in bib_entries])
        if bib_nums:
            expected ***REMOVED*** list(range(1, bib_nums[-1] + 1))
            actual ***REMOVED*** bib_nums
            missing ***REMOVED*** [n for n in expected if n not in actual]
            if missing:
                self.errors.append(f"Bibliography has gaps in numbering: missing {missing}")
                return False

        # Find citations in text
        text_citations ***REMOVED*** set(re.findall(r'\[(\d+)\]', self.content))
        bib_citations ***REMOVED*** set(bib_entries)

        # Check all citations have bibliography entries
        missing_in_bib ***REMOVED*** text_citations - bib_citations
        if missing_in_bib:
            self.errors.append(f"Citations missing from bibliography: {sorted(missing_in_bib)}")
            return False

        # Check for unused bibliography entries
        unused ***REMOVED*** bib_citations - text_citations
        if unused:
            self.warnings.append(f"Unused bibliography entries: {sorted(unused)}")

        return True

    def _check_placeholders(self) -> bool:
        """Check for placeholder text that shouldn't be in final report"""
        placeholders ***REMOVED*** [
            'TBD', 'TODO', 'FIXME', 'XXX',
            '[citation needed]', '[needs citation]',
            '[placeholder]', '[TODO]', '[TBD]'
        ]

        found_placeholders ***REMOVED*** []
        for placeholder in placeholders:
            if placeholder in self.content:
                found_placeholders.append(placeholder)

        if found_placeholders:
            self.errors.append(f"Found placeholder text: {', '.join(found_placeholders)}")
            return False

        return True

    def _check_content_truncation(self) -> bool:
        """Check for content truncation patterns (2025 Progressive Assembly enhancement)"""
        truncation_patterns ***REMOVED*** [
            (r'Content continues', 'Phrase "Content continues"'),
            (r'Due to length', 'Phrase "Due to length"'),
            (r'would continue', 'Phrase "would continue"'),
            (r'\[Sections \d+-\d+', 'Pattern "[Sections X-Y"'),
            (r'Additional sections', 'Phrase "Additional sections"'),
            (r'comprehensive.*word document that continues', 'Pattern "comprehensive...document that continues"'),
        ]

        for pattern_re, description in truncation_patterns:
            if re.search(pattern_re, self.content, re.IGNORECASE):
                self.errors.append(f"⚠️ CRITICAL: Content truncation detected: {description}")
                self.errors.append(f"   Report is INCOMPLETE and UNUSABLE - regenerate with progressive assembly")
                return False

        return True

    def _check_word_count(self) -> bool:
        """Check overall report length"""
        word_count ***REMOVED*** len(self.content.split())

        if word_count < 500:
            self.warnings.append(f"Report is very short: {word_count} words (consider expanding)")
        # No upper limit warning - progressive assembly supports unlimited lengths

        return True

    def _check_source_count(self) -> bool:
        """Check minimum source count"""
        pattern ***REMOVED*** r'## Bibliography(.*?)(?***REMOVED***##|\Z)'
        match ***REMOVED*** re.search(pattern, self.content, re.DOTALL | re.IGNORECASE)

        if not match:
            return True  # Already caught in bibliography check

        bib_section ***REMOVED*** match.group(1)
        bib_entries ***REMOVED*** re.findall(r'^\[(\d+)\]', bib_section, re.MULTILINE)

        source_count ***REMOVED*** len(set(bib_entries))

        if source_count < 10:
            self.warnings.append(f"Only {source_count} sources (recommended: ≥10)")

        return True

    def _check_broken_references(self) -> bool:
        """Check for broken internal references"""
        # Find all markdown links [text](./path)
        internal_links ***REMOVED*** re.findall(r'\[.*?\]\((\.\/.*?)\)', self.content)

        broken ***REMOVED*** []
        for link in internal_links:
            # Remove anchor if present
            link_path ***REMOVED*** link.split('#')[0]
            full_path ***REMOVED*** self.report_path.parent / link_path

            if not full_path.exists():
                broken.append(link)

        if broken:
            self.errors.append(f"Broken internal links: {', '.join(broken)}")
            return False

        return True

    def _print_summary(self):
        """Print validation summary"""
        print(f"\n{'***REMOVED***'*60}")
        print(f"VALIDATION SUMMARY")
        print(f"{'***REMOVED***'*60}\n")

        if self.errors:
            print(f"❌ ERRORS ({len(self.errors)}):")
            for error in self.errors:
                print(f"   • {error}")
            print()

        if self.warnings:
            print(f"⚠️  WARNINGS ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"   • {warning}")
            print()

        if not self.errors and not self.warnings:
            print("✅ ALL CHECKS PASSED - Report meets quality standards!\n")
        elif not self.errors:
            print("✅ VALIDATION PASSED (with warnings)\n")
        else:
            print("❌ VALIDATION FAILED - Please fix errors before delivery\n")


def main():
    parser ***REMOVED*** argparse.ArgumentParser(
        description***REMOVED***"Validate research report quality",
        formatter_class***REMOVED***argparse.RawDescriptionHelpFormatter,
        epilog***REMOVED***"""
Examples:
  python validate_report.py --report report.md
  python validate_report.py -r ~/.claude/research_output/research_report_20251104_153045.md
        """
    )

    parser.add_argument(
        '--report', '-r',
        type***REMOVED***str,
        required***REMOVED***True,
        help***REMOVED***'Path to research report markdown file'
    )

    args ***REMOVED*** parser.parse_args()

    report_path ***REMOVED*** Path(args.report)

    if not report_path.exists():
        print(f"❌ ERROR: Report file not found: {report_path}")
        sys.exit(1)

    validator ***REMOVED*** ReportValidator(report_path)
    passed ***REMOVED*** validator.validate()

    sys.exit(0 if passed else 1)


if __name__ ***REMOVED******REMOVED*** '__main__':
    main()
