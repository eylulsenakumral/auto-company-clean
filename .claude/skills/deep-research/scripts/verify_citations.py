#!/usr/bin/env python3
"""
Citation Verification Script (Enhanced with CiteGuard techniques)

Catches fabricated citations by checking:
1. DOI resolution (via doi.org)
2. Basic metadata matching (title similarity, year match)
3. URL accessibility verification
4. Hallucination pattern detection (generic titles, suspicious patterns)
5. Flags suspicious entries for manual review

Enhanced in 2025 with:
- Content alignment checking (when URL available)
- Multi-source verification (DOI + URL + metadata cross-check)
- Advanced hallucination detection patterns
- Better false positive reduction

Usage:
    python verify_citations.py --report [path]
    python verify_citations.py --report [path] --strict  # Fail on any unverified

Does NOT require API keys - uses free DOI resolver and heuristics.
"""

import sys
import argparse
import re
from pathlib import Path
from typing import List, Dict, Tuple
from urllib import request, error
from urllib.parse import quote
import json
import time

class CitationVerifier:
    """Verify citations in research report"""

    def __init__(self, report_path: Path, strict_mode: bool ***REMOVED*** False):
        self.report_path ***REMOVED*** report_path
        self.strict_mode ***REMOVED*** strict_mode
        self.content ***REMOVED*** self._read_report()
        self.suspicious ***REMOVED*** []
        self.verified ***REMOVED*** []
        self.errors ***REMOVED*** []

        # Hallucination detection patterns (2025 CiteGuard enhancement)
        self.suspicious_patterns ***REMOVED*** [
            # Generic academic-sounding but fake patterns
            (r'^(A |An |The )?(Study|Analysis|Review|Survey|Investigation) (of|on|into)',
             "Generic academic title pattern"),
            (r'^(Recent|Current|Modern|Contemporary) (Advances|Developments|Trends) in',
             "Generic 'advances' title pattern"),
            # Too perfect, templated titles
            (r'^[A-Z][a-z]+ [A-Z][a-z]+: A (Comprehensive|Complete|Systematic) (Review|Analysis|Guide)$',
             "Too perfect, templated structure"),
        ]

    def _read_report(self) -> str:
        """Read report file"""
        try:
            with open(self.report_path, 'r', encoding***REMOVED***'utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"L ERROR: Cannot read report: {e}")
            sys.exit(1)

    def extract_bibliography(self) -> List[Dict]:
        """Extract bibliography entries from report"""
        pattern ***REMOVED*** r'## Bibliography(.*?)(?***REMOVED***##|\Z)'
        match ***REMOVED*** re.search(pattern, self.content, re.DOTALL | re.IGNORECASE)

        if not match:
            self.errors.append("No Bibliography section found")
            return []

        bib_section ***REMOVED*** match.group(1)

        # Parse entries: [N] Author (Year). "Title". Venue. URL
        entries ***REMOVED*** []
        lines ***REMOVED*** bib_section.strip().split('\n')

        current_entry ***REMOVED*** None
        for line in lines:
            line ***REMOVED*** line.strip()
            if not line:
                continue

            # Check if starts with citation number [N]
            match_num ***REMOVED*** re.match(r'^\[(\d+)\]\s+(.+)$', line)
            if match_num:
                if current_entry:
                    entries.append(current_entry)

                num ***REMOVED*** match_num.group(1)
                rest ***REMOVED*** match_num.group(2)

                # Try to parse: Author (Year). "Title". Venue. URL
                year_match ***REMOVED*** re.search(r'\((\d{4})\)', rest)
                title_match ***REMOVED*** re.search(r'"([^"]+)"', rest)
                doi_match ***REMOVED*** re.search(r'doi\.org/(10\.\S+)', rest)
                url_match ***REMOVED*** re.search(r'https?://[^\s\)]+', rest)

                current_entry ***REMOVED*** {
                    'num': num,
                    'raw': rest,
                    'year': year_match.group(1) if year_match else None,
                    'title': title_match.group(1) if title_match else None,
                    'doi': doi_match.group(1) if doi_match else None,
                    'url': url_match.group(0) if url_match else None
                }
            elif current_entry:
                # Multi-line entry, append to raw
                current_entry['raw'] +***REMOVED*** ' ' + line

        if current_entry:
            entries.append(current_entry)

        return entries

    def verify_doi(self, doi: str) -> Tuple[bool, Dict]:
        """
        Verify DOI exists and get metadata.
        Returns (success, metadata_dict)
        """
        if not doi:
            return False, {}

        try:
            # Use content negotiation to get JSON metadata
            url ***REMOVED*** f"https://doi.org/{quote(doi)}"
            req ***REMOVED*** request.Request(url)
            req.add_header('Accept', 'application/vnd.citationstyles.csl+json')

            with request.urlopen(req, timeout***REMOVED***10) as response:
                data ***REMOVED*** json.loads(response.read().decode('utf-8'))

                return True, {
                    'title': data.get('title', ''),
                    'year': data.get('issued', {}).get('date-parts', [[None]])[0][0],
                    'authors': [
                        f"{a.get('family', '')} {a.get('given', '')}"
                        for a in data.get('author', [])
                    ],
                    'venue': data.get('container-title', '')
