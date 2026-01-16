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
            '</h2></div>\n<div class***REMOVED***"section">',
            1
        )

    return html


def _convert_bibliography_section(markdown: str) -> str:
    """Convert bibliography section to HTML"""
    if not markdown.strip():
        return ""

    html ***REMOVED*** markdown

    # Convert each [N] citation to a proper bibliography entry
    # Look for patterns like [1] Title - URL
    html ***REMOVED*** re.sub(
        r'\[(\d+)\]\s*(.+?)\s*-\s*(https?://[^\s\)]+)',
        r'<div class***REMOVED***"bib-entry"><span class***REMOVED***"bib-number">[\1]</span> <a href***REMOVED***"\3" target***REMOVED***"_blank">\2</a></div>',
        html
    )

    # Convert any remaining **bold** sections
    html ***REMOVED*** re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)

    # Wrap in bibliography content div
    html ***REMOVED*** f'<div class***REMOVED***"bibliography-content">{html}</div>'

    return html


def _convert_lists(html: str) -> str:
    """Convert markdown lists to HTML lists"""
    lines ***REMOVED*** html.split('\n')
    result ***REMOVED*** []
    in_list ***REMOVED*** False
    list_level ***REMOVED*** 0

    for i, line in enumerate(lines):
        stripped ***REMOVED*** line.strip()

        # Check for unordered list item
        if stripped.startswith('- ') or stripped.startswith('* '):
            if not in_list:
                result.append('<ul>')
                in_list ***REMOVED*** True
                list_level ***REMOVED*** len(line) - len(line.lstrip())

            # Get the content after the marker
            content ***REMOVED*** stripped[2:]
            result.append(f'<li>{content}</li>')

        # Check for ordered list item
        elif re.match(r'^\d+\.\s', stripped):
            if not in_list:
                result.append('<ol>')
                in_list ***REMOVED*** True
                list_level ***REMOVED*** len(line) - len(line.lstrip())

            # Get the content after the number and period
            content ***REMOVED*** re.sub(r'^\d+\.\s', '', stripped)
            result.append(f'<li>{content}</li>')

        else:
            # Not a list item
            if in_list:
                # Check if we're still in the list (indented continuation)
                current_level ***REMOVED*** len(line) - len(line.lstrip())
                if current_level > list_level and stripped:
                    # Continuation of previous list item
                    if result[-1].endswith('</li>'):
                        result[-1] ***REMOVED*** result[-1][:-5] + ' ' + stripped + '</li>'
                    continue
                else:
                    # End of list
                    result.append('</ul>' if '<ul>' in '\n'.join(result[-10:]) else '</ol>')
                    in_list ***REMOVED*** False
                    list_level ***REMOVED*** 0

            result.append(line)

    # Close any remaining open list
    if in_list:
        result.append('</ul>' if '<ul>' in '\n'.join(result[-10:]) else '</ol>')

    return '\n'.join(result)


def _convert_tables(html: str) -> str:
    """Convert markdown tables to HTML tables"""
    lines ***REMOVED*** html.split('\n')
    result ***REMOVED*** []
    in_table ***REMOVED*** False

    for i, line in enumerate(lines):
        if '|' in line and line.strip().startswith('|'):
            if not in_table:
                result.append('<table>')
                in_table ***REMOVED*** True
                # This is the header row
                cells ***REMOVED*** [cell.strip() for cell in line.split('|')[1:-1]]
                result.append('<thead><tr>')
                for cell in cells:
                    result.append(f'<th>{cell}</th>')
                result.append('</tr></thead>')
                result.append('<tbody>')
            elif '---' in line:
                # Skip separator row
                continue
            else:
                # Data row
                cells ***REMOVED*** [cell.strip() for cell in line.split('|')[1:-1]]
                result.append('<tr>')
                for cell in cells:
                    result.append(f'<td>{cell}</td>')
                result.append('</tr>')
        else:
            if in_table:
                result.append('</tbody></table>')
                in_table ***REMOVED*** False
            result.append(line)

    if in_table:
        result.append('</tbody></table>')

    return '\n'.join(result)


def _convert_paragraphs(html: str) -> str:
    """Wrap non-HTML lines in paragraph tags"""
    lines ***REMOVED*** html.split('\n')
    result ***REMOVED*** []
    in_paragraph ***REMOVED*** False

    for line in lines:
        stripped ***REMOVED*** line.strip()

        # Skip empty lines
        if not stripped:
            if in_paragraph:
                result.append('</p>')
                in_paragraph ***REMOVED*** False
            result.append(line)
            continue

        # Skip lines that are already HTML tags
        if (stripped.startswith('<') and stripped.endswith('>')) or \
           stripped.startswith('</') or \
           '<h' in stripped or '<div' in stripped or '<ul' in stripped or \
           '<ol' in stripped or '<li' in stripped or '<table' in stripped or \
           '</div>' in stripped or '</ul>' in stripped or '</ol>' in stripped:
            if in_paragraph:
                result.append('</p>')
                in_paragraph ***REMOVED*** False
            result.append(line)
            continue

        # Regular text line - wrap in paragraph
        if not in_paragraph:
            result.append('<p>' + line)
            in_paragraph ***REMOVED*** True
        else:
            result.append(line)

    if in_paragraph:
        result.append('</p>')

    return '\n'.join(result)


def _close_sections(html: str) -> str:
    """Close all open section divs"""
    # Count open and closed divs
    open_divs ***REMOVED*** html.count('<div class***REMOVED***"section">')
    closed_divs ***REMOVED*** html.count('</div>')

    # Add closing divs for sections
    # Each section should be closed before the next section starts
    lines ***REMOVED*** html.split('\n')
    result ***REMOVED*** []
    section_open ***REMOVED*** False

    for i, line in enumerate(lines):
        if '<div class***REMOVED***"section">' in line:
            if section_open:
                result.append('</div>')  # Close previous section
            section_open ***REMOVED*** True
        result.append(line)

    # Close final section if still open
    if section_open:
        result.append('</div>')

    return '\n'.join(result)


def main():
    """Test the converter with a sample markdown file"""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python md_to_html.py <markdown_file>")
        sys.exit(1)

    md_file ***REMOVED*** Path(sys.argv[1])
    if not md_file.exists():
        print(f"Error: File {md_file} not found")
        sys.exit(1)

    markdown_text ***REMOVED*** md_file.read_text()
    content_html, bib_html ***REMOVED*** convert_markdown_to_html(markdown_text)

    print("***REMOVED******REMOVED******REMOVED*** CONTENT HTML ***REMOVED******REMOVED******REMOVED***")
    print(content_html[:1000])
    print("\n***REMOVED******REMOVED******REMOVED*** BIBLIOGRAPHY HTML ***REMOVED******REMOVED******REMOVED***")
    print(bib_html[:500])


if __name__ ***REMOVED******REMOVED*** "__main__":
    main()
