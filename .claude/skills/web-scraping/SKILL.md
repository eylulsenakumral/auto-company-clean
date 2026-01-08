---
name: web-scraping
description: Web scraping with anti-bot bypass, content extraction, undocumented APIs and poison pill detection. Use when extracting content from websites, handling paywalls, implementing scraping cascades or processing social media. Covers requests, trafilatura, Playwright with stealth mode, yt-dlp and instaloader patterns.
---

# Web scraping methodology

Patterns for reliable, ethical web scraping with fallback strategies and anti-bot handling.

## Scraping cascade architecture

Implement multiple extraction strategies with automatic fallback:

```python
from abc import ABC, abstractmethod
from typing import Optional
import requests
from bs4 import BeautifulSoup
import trafilatura

#for .py files
from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync

#for .ipynb files
import asyncio
from playwright.async_api import async_playwright

class ScrapingResult:
    def __init__(self, content: str, title: str, method: str):
        self.content ***REMOVED*** content
        self.title ***REMOVED*** title
        self.method ***REMOVED*** method  # Track which method succeeded

class Scraper(ABC):
    @abstractmethod
    def fetch(self, url: str) -> Optional[ScrapingResult]: ...

class TrafilaturaСscraper(Scraper):
    """Fast, lightweight extraction for standard articles."""

    def fetch(self, url: str) -> Optional[ScrapingResult]:
        try:
            downloaded ***REMOVED*** trafilatura.fetch_url(url)
            if not downloaded:
                return None

            content ***REMOVED*** trafilatura.extract(
                downloaded,
                include_comments***REMOVED***False,
                include_tables***REMOVED***True,
                favor_recall***REMOVED***True
            )

            if not content or len(content) < 100:
                return None

            # Extract title separately
            soup ***REMOVED*** BeautifulSoup(downloaded, 'html.parser')
            title ***REMOVED*** soup.find('title')
            title_text ***REMOVED*** title.get_text() if title else ''

            return ScrapingResult(content, title_text, 'trafilatura')
        except Exception:
            return None

class RequestsScraper(Scraper):
    """HTTP requests with rotating user agents."""

    USER_AGENTS ***REMOVED*** [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    ]

    def fetch(self, url: str) -> Optional[ScrapingResult]:
        import random

        headers ***REMOVED*** {
            'User-Agent': random.choice(self.USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q***REMOVED***0.9',
        }

        try:
            response ***REMOVED*** requests.get(url, headers***REMOVED***headers, timeout***REMOVED***30)
            response.raise_for_status()

            soup ***REMOVED*** BeautifulSoup(response.text, 'html.parser')

            # Remove script/style elements
            for element in soup(['script', 'style', 'nav', 'footer', 'aside']):
                element.decompose()

            # Find main content
            main ***REMOVED*** soup.find('main') or soup.find('article') or soup.find('body')
            content ***REMOVED*** main.get_text(separator***REMOVED***'\n', strip***REMOVED***True) if main else ''

            title ***REMOVED*** soup.find('title')
            title_text ***REMOVED*** title.get_text() if title else ''

            if len(content) < 100:
                return None

            return ScrapingResult(content, title_text, 'requests')
        except Exception:
            return None

class PlaywrightScraper(Scraper):
    """Heavy JavaScript rendering with stealth mode for anti-bot bypass."""

    def fetch(self, url: str) -> Optional[ScrapingResult]:
        try:
            with sync_playwright() as p:
                browser ***REMOVED*** p.chromium.launch(headless***REMOVED***True)
                context ***REMOVED*** browser.new_context(
                    viewport***REMOVED***{'width': 1920, 'height': 1080},
                    user_agent***REMOVED***'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                )
                page ***REMOVED*** context.new_page()

                # Apply stealth to avoid detection
                stealth_sync(page)

                page.goto(url, wait_until***REMOVED***'networkidle', timeout***REMOVED***60000)

                # Wait for content to load
                page.wait_for_timeout(2000)

                # Extract content
                content ***REMOVED*** page.evaluate('''() ***REMOVED***> {
                    const article ***REMOVED*** document.querySelector('article, main, .content, #content');
                    return article ? article.innerText : document.body.innerText;
                }''')

                title ***REMOVED*** page.title()

                browser.close()

                if len(content) < 100:
                    return None

                return ScrapingResult(content, title, 'playwright')
        except Exception:
            return None

class PlaywrightScraperAsync:
    """Async Playwright scraper for Jupyter notebooks (.ipynb files).
    
    Jupyter notebooks run their own event loop, so sync Playwright won't work.
    Use this async version with `await` in notebook cells.
    """

    async def fetch(self, url: str) -> Optional[ScrapingResult]:
        try:
            async with async_playwright() as p:
                browser ***REMOVED*** await p.chromium.launch(headless***REMOVED***True)
                context ***REMOVED*** await browser.new_context(
                    viewport***REMOVED***{'width': 1920, 'height': 1080},
                    user_agent***REMOVED***'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                )
                page ***REMOVED*** await context.new_page()

                # Note: playwright-stealth async version
                # from playwright_stealth import stealth_async
                # await stealth_async(page)

                await page.goto(url, wait_until***REMOVED***'networkidle', timeout***REMOVED***60000)

                # Wait for content to load
                await page.wait_for_timeout(2000)

                # Extract content
                content ***REMOVED*** await page.evaluate('''() ***REMOVED***> {
                    const article ***REMOVED*** document.querySelector('article, main, .content, #content');
                    return article ? article.innerText : document.body.innerText;
                }''')

                title ***REMOVED*** await page.title()

                await browser.close()

                if len(content) < 100:
                    return None

                return ScrapingResult(content, title, 'playwright_async')
        except Exception:
            return None

# Usage in Jupyter notebook cells:
# scraper ***REMOVED*** PlaywrightScraperAsync()
# result ***REMOVED*** await scraper.fetch('https://example.com')

class ScrapingCascade:
    """Try multiple scrapers in order until one succeeds."""

    def __init__(self):
        self.scrapers ***REMOVED*** [
            TrafilaturaСscraper(),
            RequestsScraper(),
            PlaywrightScraper(),
        ]

    def fetch(self, url: str) -> Optional[ScrapingResult]:
        for scraper in self.scrapers:
            result ***REMOVED*** scraper.fetch(url)
            if result:
                return result
        return None
```

## Undocumented APIs

### Finding undocumented APIs

Use browser developer tools to discover APIs:

1. **Open developer tools** (right-click → Inspect, or F12)
2. **Go to the Network tab** to monitor all requests
3. **Filter by Fetch/XHR** to show only API calls
4. **Trigger the action** you want to capture (search, scroll, click)
5. **Analyze the response** — usually JSON with key-value pairs
6. **Copy as cURL** (right-click the request)
7. **Convert to code** using [curlconverter.com](https://curlconverter.com/)

### Stripping down API requests

When you copy a cURL from dev tools, it includes many parameters. Strip it down by:

1. **Remove unnecessary cookies** — test without them first
2. **Keep authentication tokens** if required
3. **Identify the input parameters** you can modify (like `prefix` for search terms)
4. **Test parameter values** — some expire, so periodically verify

### Example: Reverse-engineering an autocomplete API

```python
import requests
import time

def search_suggestions(keyword: str) -> dict:
    """
    Get autocompleted search suggestions from an undocumented API.
    Stripped down from browser dev tools capture.
    """
    headers ***REMOVED*** {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0',
        'Accept': 'application/json, text/javascript, */*; q***REMOVED***0.01',
        'Accept-Language': 'en-US,en;q***REMOVED***0.5',
    }

    params ***REMOVED*** {
        'prefix': keyword,
        'suggestion-type': ['WIDGET', 'KEYWORD'],
        'alias': 'aps',
        'plain-mid': '1',
    }

    response ***REMOVED*** requests.get(
        'https://completion.amazon.com/api/2017/suggestions',
        params***REMOVED***params,
        headers***REMOVED***headers
    )
    return response.json()

# Collect suggestions for multiple keywords
keywords ***REMOVED*** ['a', 'b', 'cookie', 'sock']
data ***REMOVED*** []

for keyword in keywords:
    suggestions ***REMOVED*** search_suggestions(keyword)
    suggestions['search_word'] ***REMOVED*** keyword  # track seed keyword
    time.sleep(1)  # rate limit yourself
    data.extend(suggestions.get('suggestions', []))
```
*Source: [Leon Yin, "Finding Undocumented APIs," Inspect Element](https://inspectelement.org/apis.html), 2023*

## Poison pill detection

Detect paywalls, anti-bot pages, and other failures:

```python
from dataclasses import dataclass
from enum import Enum
import re

class PoisonPillType(Enum):
    PAYWALL ***REMOVED*** 'paywall'
    CAPTCHA ***REMOVED*** 'captcha'
    RATE_LIMIT ***REMOVED*** 'rate_limit'
    CLOUDFLARE ***REMOVED*** 'cloudflare'
    LOGIN_REQUIRED ***REMOVED*** 'login_required'
    NOT_FOUND ***REMOVED*** 'not_found'
    NONE ***REMOVED*** 'none'

@dataclass
class PoisonPillResult:
    detected: bool
    type: PoisonPillType
    confidence: float
    details: str

class PoisonPillDetector:
    PATTERNS ***REMOVED*** {
        PoisonPillType.PAYWALL: [
            r'subscribe to continue',
            r'subscription required',
            r'become a member',
            r'sign up to read',
            r'you\'ve reached your limit',
            r'article limit reached',
        ],
        PoisonPillType.CAPTCHA: [
            r'verify you are human',
            r'captcha',
            r'robot verification',
            r'prove you\'re not a robot',
        ],
        PoisonPillType.RATE_LIMIT: [
            r'too many requests',
            r'rate limit exceeded',
            r'slow down',
            r'429',
        ],
        PoisonPillType.CLOUDFLARE: [
            r'checking your browser',
            r'cloudflare',
            r'ddos protection',
            r'please wait while we verify',
        ],
        PoisonPillType.LOGIN_REQUIRED: [
            r'sign in to continue',
            r'log in required',
            r'create an account',
        ],
    }

    PAYWALL_DOMAINS ***REMOVED*** {
        'nytimes.com': PoisonPillType.PAYWALL,
        'wsj.com': PoisonPillType.PAYWALL,
        'washingtonpost.com': PoisonPillType.PAYWALL,
        'ft.com': PoisonPillType.PAYWALL,
        'bloomberg.com': PoisonPillType.PAYWALL,
    }

    def detect(self, url: str, content: str, status_code: int ***REMOVED*** 200) -> PoisonPillResult:
        # Check status code
        if status_code ***REMOVED******REMOVED*** 429:
            return PoisonPillResult(True, PoisonPillType.RATE_LIMIT, 1.0, 'HTTP 429')
        if status_code ***REMOVED******REMOVED*** 403:
            return PoisonPillResult(True, PoisonPillType.CLOUDFLARE, 0.8, 'HTTP 403')
        if status_code ***REMOVED******REMOVED*** 404:
            return PoisonPillResult(True, PoisonPillType.NOT_FOUND, 1.0, 'HTTP 404')

        # Check known paywall domains
        from urllib.parse import urlparse
        domain ***REMOVED*** urlparse(url).netloc.replace('www.', '')
        for paywall_domain, pill_type in self.PAYWALL_DOMAINS.items():
            if paywall_domain in domain:
                # Check if content is suspiciously short (paywall truncation)
                if len(content) < 500:
                    return PoisonPillResult(True, pill_type, 0.9, f'Short content from {domain}')

        # Pattern matching
        content_lower ***REMOVED*** content.lower()
        for pill_type, patterns in self.PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, content_lower):
                    return PoisonPillResult(True, pill_type, 0.7, f'Pattern match: {pattern}')

        return PoisonPillResult(False, PoisonPillType.NONE, 0.0, '')
```

## Social media scraping

### YouTube with yt-dlp

```python
import yt_dlp
from pathlib import Path

def download_video_metadata(url: str) -> dict:
    """Extract metadata without downloading video."""
    ydl_opts ***REMOVED*** {
        'skip_download': True,
        'quiet': True,
        'no_warnings': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info ***REMOVED*** ydl.extract_info(url, download***REMOVED***False)
        return {
            'title': info.get('title'),
            'description': info.get('description'),
            'duration': info.get('duration'),
            'upload_date': info.get('upload_date'),
            'view_count': info.get('view_count'),
            'channel': info.get('channel'),
            'thumbnail': info.get('thumbnail'),
        }

def download_video(url: str, output_dir: Path, audio_only: bool ***REMOVED*** False) -> Path:
    """Download video or audio."""
    output_template ***REMOVED*** str(output_dir / '%(title)s.%(ext)s')

    ydl_opts ***REMOVED*** {
        'outtmpl': output_template,
        'quiet': True,
    }

    if audio_only:
        ydl_opts['format'] ***REMOVED*** 'bestaudio/best'
        ydl_opts['postprocessors'] ***REMOVED*** [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }]

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info ***REMOVED*** ydl.extract_info(url, download***REMOVED***True)
        filename ***REMOVED*** ydl.prepare_filename(info)
        if audio_only:
            filename ***REMOVED*** filename.rsplit('.', 1)[0] + '.mp3'
        return Path(filename)

def get_transcript(url: str) -> list[dict]:
    """Extract auto-generated or manual subtitles."""
    ydl_opts ***REMOVED*** {
        'skip_download': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['en'],
        'quiet': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info ***REMOVED*** ydl.extract_info(url, download***REMOVED***False)

        # Check for subtitles
        subtitles ***REMOVED*** info.get('subtitles', {})
        auto_captions ***REMOVED*** info.get('automatic_captions', {})

        # Prefer manual subtitles over auto-generated
        subs ***REMOVED*** subtitles.get('en') or auto_captions.get('en')
        if not subs:
            return []

        # Get the vtt or json format
        for sub in subs:
            if sub['ext'] in ['vtt', 'json3']:
                # Download and parse subtitle file
                # ... implementation depends on format
                pass

        return []
```

### Instagram with instaloader

```python
import instaloader
from pathlib import Path

class InstagramScraper:
    def __init__(self, username: str ***REMOVED*** None, session_file: str ***REMOVED*** None):
