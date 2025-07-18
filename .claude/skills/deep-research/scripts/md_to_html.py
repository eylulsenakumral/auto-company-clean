#!/usr/bin/env python3
"""
Markdown to HTML converter for research reports
Properly converts markdown sections to HTML while preserving structure and formatting
"""

import re
from typing import Tuple
from pathlib import Path


def convert_markdown_to_html(markdown_text: str) -> Tuple[str, str]:
    """
    Convert markdown to HTML in two parts: content and bibliography

    Args:
        markdown_text: Full markdown report text

    Returns:
        Tuple of (content_html, bibliography_html)
    """
    # Split content and bibliography
    parts ***REMOVED*** markdown_text.split('## Bibliography')
    content_md ***REMOVED*** parts[0]
    bibliography_md ***REMOVED*** parts[1] if len(parts) > 1 else ""

    # Convert content (everything except bibliography)
    content_html ***REMOVED*** _convert_content_section(content_md)

    # Convert bibliography separately
    bibliography_html ***REMOVED*** _convert_bibliography_section(bibliography_md)

    return content_html, bibliography_html


def _convert_content_section(markdown: str) -> str:
    """Convert main content sections to HTML"""
    html ***REMOVED*** markdown

    # Remove title and front matter (first ## heading is handled separately)
    lines ***REMOVED*** html.split('\n')
    processed_lines ***REMOVED*** []
    skip_until_first_section ***REMOVED*** True

    for line in lines:
        # Skip everything until we hit "## Executive Summary" or first major section
        if skip_until_first_section:
            if line.startswith('## ') and not line.startswith('### '):
                skip_until_first_section ***REMOVED*** False
                processed_lines.append(line)
            continue
        processed_lines.append(line)

    html ***REMOVED*** '\n'.join(processed_lines)

    # Convert headers
    # ## Section Title → <div class***REMOVED***"section"><h2 class***REMOVED***"section-title">Section Title</h2></div>
    html ***REMOVED*** re.sub(
        r'^## (.+)$',
        r'<div class***REMOVED***"section"><h2 class***REMOVED***"section-title">\1</h2>',
        html,
        flags***REMOVED***re.MULTILINE
    )

    # ### Subsection → <h3 class***REMOVED***"subsection-title">Subsection</h3>
    html ***REMOVED*** re.sub(
        r'^### (.+)$',
        r'<h3 class***REMOVED***"subsection-title">\1</h3>',
        html,
        flags***REMOVED***re.MULTILINE
    )

    # #### Subsubsection → <h4 class***REMOVED***"subsubsection-title">Title</h4>
    html ***REMOVED*** re.sub(
        r'^#### (.+)$',
        r'<h4 class***REMOVED***"subsubsection-title">\1</h4>',
        html,
        flags***REMOVED***re.MULTILINE
    )

    # Convert **bold** text
    html ***REMOVED*** re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)

    # Convert *italic* text
    html ***REMOVED*** re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)

    # Convert inline code `code`
    html ***REMOVED*** re.sub(r'`(.+?)`', r'<code>\1</code>', html)

    # Convert unordered lists
    html ***REMOVED*** _convert_lists(html)

    # Convert tables
    html ***REMOVED*** _convert_tables(html)

    # Convert paragraphs (wrap non-HTML lines in <p> tags)
    html ***REMOVED*** _convert_paragraphs(html)

    # Close all open sections
    html ***REMOVED*** _close_sections(html)

    # Wrap executive summary if present
    html ***REMOVED*** html.replace(
        '<h2 class***REMOVED***"section-title">Executive Summary</h2>',
        '<div class***REMOVED***"executive-summary"><h2 class***REMOVED***"section-title">Executive Summary</h2>'
    )
    if '<div class***REMOVED***"executive-summary">' in html:
        # Close executive summary at the next section
        html ***REMOVED*** html.replace(
            '</h2>\n<div class***REMOVED***"section">',
