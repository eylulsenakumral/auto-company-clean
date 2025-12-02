#!/usr/bin/env python3
"""
Citation Management System
Tracks sources, generates citations, and maintains bibliography
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime
from urllib.parse import urlparse
import hashlib


@dataclass
class Citation:
    """Represents a single citation"""
    id: str
    title: str
    url: str
    authors: Optional[List[str]] ***REMOVED*** None
    publication_date: Optional[str] ***REMOVED*** None
    retrieved_date: str ***REMOVED*** field(default_factory***REMOVED***lambda: datetime.now().strftime('%Y-%m-%d'))
    source_type: str ***REMOVED*** "web"  # web, academic, documentation, book, paper
    doi: Optional[str] ***REMOVED*** None
    citation_count: int ***REMOVED*** 0

    def to_apa(self, index: int) -> str:
        """Generate APA format citation"""
        author_str ***REMOVED*** ""
        if self.authors:
            if len(self.authors) ***REMOVED******REMOVED*** 1:
                author_str ***REMOVED*** f"{self.authors[0]}."
            elif len(self.authors) ***REMOVED******REMOVED*** 2:
                author_str ***REMOVED*** f"{self.authors[0]} & {self.authors[1]}."
            else:
                author_str ***REMOVED*** f"{self.authors[0]} et al."

        date_str ***REMOVED*** f"({self.publication_date})" if self.publication_date else "(n.d.)"

        return f"[{index}] {author_str} {date_str}. {self.title}. Retrieved {self.retrieved_date}, from {self.url}"

    def to_inline(self, index: int) -> str:
        """Generate inline citation [index]"""
        return f"[{index}]"

    def to_markdown(self, index: int) -> str:
        """Generate markdown link format"""
        return f"[{index}] [{self.title}]({self.url}) (Retrieved: {self.retrieved_date})"


class CitationManager:
    """Manages citations and bibliography"""

    def __init__(self):
        self.citations: Dict[str, Citation] ***REMOVED*** {}
        self.citation_order: List[str] ***REMOVED*** []

    def add_source(
        self,
        url: str,
        title: str,
        authors: Optional[List[str]] ***REMOVED*** None,
        publication_date: Optional[str] ***REMOVED*** None,
        source_type: str ***REMOVED*** "web",
        doi: Optional[str] ***REMOVED*** None
    ) -> str:
        """Add a source and return its citation ID"""
        # Generate unique ID based on URL
        citation_id ***REMOVED*** hashlib.md5(url.encode()).hexdigest()[:8]

        if citation_id not in self.citations:
            citation ***REMOVED*** Citation(
                id***REMOVED***citation_id,
                title***REMOVED***title,
                url***REMOVED***url,
                authors***REMOVED***authors,
                publication_date***REMOVED***publication_date,
                source_type***REMOVED***source_type,
                doi***REMOVED***doi
            )
            self.citations[citation_id] ***REMOVED*** citation
            self.citation_order.append(citation_id)

        # Increment citation count
        self.citations[citation_id].citation_count +***REMOVED*** 1

        return citation_id

    def get_citation_number(self, citation_id: str) -> Optional[int]:
        """Get the citation number for a given ID"""
        try:
            return self.citation_order.index(citation_id) + 1
        except ValueError:
            return None

    def get_inline_citation(self, citation_id: str) -> str:
        """Get inline citation marker [n]"""
        num ***REMOVED*** self.get_citation_number(citation_id)
        return f"[{num}]" if num else "[?]"

    def generate_bibliography(self, style: str ***REMOVED*** "markdown") -> str:
        """Generate full bibliography"""
        if style ***REMOVED******REMOVED*** "markdown":
            lines ***REMOVED*** ["## Bibliography\n"]
            for i, citation_id in enumerate(self.citation_order, 1):
                citation ***REMOVED*** self.citations[citation_id]
                lines.append(citation.to_markdown(i))
            return "\n".join(lines)

        elif style ***REMOVED******REMOVED*** "apa":
            lines ***REMOVED*** ["## Bibliography\n"]
            for i, citation_id in enumerate(self.citation_order, 1):
                citation ***REMOVED*** self.citations[citation_id]
                lines.append(citation.to_apa(i))
            return "\n".join(lines)

        return "Unsupported citation style"

    def get_statistics(self) -> Dict[str, any]:
        """Get citation statistics"""
        return {
            'total_sources': len(self.citations),
            'total_citations': sum(c.citation_count for c in self.citations.values()),
            'source_types': self._count_by_type(),
            'most_cited': self._get_most_cited(5),
            'uncited': self._get_uncited()
        }

    def _count_by_type(self) -> Dict[str, int]:
        """Count sources by type"""
        counts ***REMOVED*** {}
        for citation in self.citations.values():
            counts[citation.source_type] ***REMOVED*** counts.get(citation.source_type, 0) + 1
        return counts

    def _get_most_cited(self, n: int ***REMOVED*** 5) -> List[tuple]:
        """Get most cited sources"""
        sorted_citations ***REMOVED*** sorted(
            self.citations.items(),
            key***REMOVED***lambda x: x[1].citation_count,
            reverse***REMOVED***True
        )
        return [(self.get_citation_number(cid), c.title, c.citation_count)
                for cid, c in sorted_citations[:n]]

    def _get_uncited(self) -> List[str]:
        """Get sources that were added but never cited"""
        return [c.title for c in self.citations.values() if c.citation_count ***REMOVED******REMOVED*** 0]

    def export_to_file(self, filepath: str, style: str ***REMOVED*** "markdown"):
        """Export bibliography to file"""
        with open(filepath, 'w') as f:
            f.write(self.generate_bibliography(style))


# Example usage
if __name__ ***REMOVED******REMOVED*** '__main__':
    manager ***REMOVED*** CitationManager()

    # Add sources
    id1 ***REMOVED*** manager.add_source(
        url***REMOVED***"https://example.com/article1",
        title***REMOVED***"Understanding Deep Research",
        authors***REMOVED***["Smith, J.", "Johnson, K."],
        publication_date***REMOVED***"2025"
    )

    id2 ***REMOVED*** manager.add_source(
        url***REMOVED***"https://example.com/article2",
        title***REMOVED***"AI Research Methods",
        source_type***REMOVED***"academic"
    )

    # Use citations
    print(f"Inline citation: {manager.get_inline_citation(id1)}")
    print(f"\nBibliography:\n{manager.generate_bibliography()}")
    print(f"\nStatistics:\n{manager.get_statistics()}")
