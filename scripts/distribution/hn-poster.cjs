#!/usr/bin/env node

/**
 * HN Auto-Poster
 *
 * Post to Hacker News with optimal timing and content format.
 * Best time: 9-10 AM ET Tuesday (learned from data).
 *
 * Usage:
 *   node hn-poster.js post --title "My Project" --url "https://example.com"
 *   node hn-poster.js best-time
 *   node hn-poster.js --help
 */

const https ***REMOVED*** require('https');
const http ***REMOVED*** require('http');

// Hacker News API endpoints
const HN_API_BASE ***REMOVED*** 'https://hacker-news.firebaseio.com/v0';
const HN_WEB_BASE ***REMOVED*** 'https://news.ycombinator.com';

// ANSI colors for terminal output
const colors ***REMOVED*** {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color ***REMOVED*** colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`ERROR: ${message}`, colors.red);
}

function warn(message) {
  log(`WARN: ${message}`, colors.yellow);
}

function success(message) {
  log(`SUCCESS: ${message}`, colors.green);
}

function info(message) {
  log(`INFO: ${message}`, colors.cyan);
}

/**
 * Make HTTP request to HN API
 */
function hnRequest(path) {
  return new Promise((resolve, reject) ***REMOVED***> {
    const url ***REMOVED*** `${HN_API_BASE}${path}`;
    https.get(url, (res) ***REMOVED***> {
      let data ***REMOVED*** '';
      res.on('data', chunk ***REMOVED***> data +***REMOVED*** chunk);
      res.on('end', () ***REMOVED***> {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Get optimal posting time based on historical data
 */
function getBestTime() {
  const times ***REMOVED*** [
    { time: '9-10 AM ET', day: 'Tuesday', reason: 'High engagement, mid-week momentum' },
    { time: '8-9 AM ET', day: 'Tuesday', reason: 'Early birds catching up' },
    { time: '9-10 AM ET', day: 'Wednesday', reason: 'Consistent secondary peak' },
    { time: '10-11 AM ET', day: 'Monday', reason: 'Weekend backlog clearing' }
  ];

  log('\n***REMOVED******REMOVED******REMOVED*** Optimal HN Posting Times ***REMOVED******REMOVED******REMOVED***', colors.bright);
  times.forEach((t, i) ***REMOVED***> {
    log(`\n${i + 1}. ${t.time} on ${t.day}`, colors.green);
    log(`   → ${t.reason}`, colors.reset);
  });

  const now ***REMOVED*** new Date();
  const etNow ***REMOVED*** new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const currentHour ***REMOVED*** etNow.getHours();
  const currentDay ***REMOVED*** etNow.getDay();

  log('\n***REMOVED******REMOVED******REMOVED*** Current Time (ET) ***REMOVED******REMOVED******REMOVED***', colors.bright);
  log(`${etNow.toLocaleString('en-US', { timeZone: 'America/New_York' })}`, colors.cyan);

  if (currentDay ***REMOVED******REMOVED******REMOVED*** 2 && currentHour >***REMOVED*** 9 && currentHour <***REMOVED*** 10) {
    success('\n🎯 NOW is optimal time to post!');
  } else {
    warn('\n⏰ Not optimal time. Best: Tuesday 9-10 AM ET');
  }

  return { times, now: etNow };
}

/**
 * Validate post content for HN standards
 */
function validatePost(title, url) {
  const issues ***REMOVED*** [];

  if (!title || title.length < 5) {
    issues.push('Title must be at least 5 characters');
  }
  if (title && title.length > 80) {
    issues.push('Title should be under 80 characters (current: ' + title.length + ')');
  }
  if (!url || !isValidUrl(url)) {
    issues.push('Invalid URL format');
  }

  // Check for spammy patterns
  const spamPatterns ***REMOVED*** [/amazing/i, /incredible/i, /must.?see/i, /click here/i];
  spamPatterns.forEach(pattern ***REMOVED***> {
    if (pattern.test(title)) {
      issues.push(`Avoid spammy words in title: "${pattern.source}"`);
    }
  });

  return issues;
}

/**
 * Basic URL validation
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Post to Hacker News
 * Note: This simulates the post. Actual posting requires OAuth/user auth.
 * For now, it returns the direct post URL for manual submission.
 */
async function postToHN(title, url, text ***REMOVED*** null) {
  log('\n***REMOVED******REMOVED******REMOVED*** HN Post Preview ***REMOVED******REMOVED******REMOVED***', colors.bright);
  log(`Title: ${title}`, colors.green);
  log(`URL: ${url}`, colors.cyan);
  if (text) {
    log(`Text: ${text.substring(0, 100)}...`, colors.reset);
  }

  // Validation
  const issues ***REMOVED*** validatePost(title, url);
  if (issues.length > 0) {
    error('\nValidation failed:');
    issues.forEach(issue ***REMOVED***> log(`  - ${issue}`, colors.red));
    return null;
  }

  // Check for duplicate posts
  info('\nChecking for existing posts with this URL...');

  try {
    // Get recent stories to check for duplicates
    const stories ***REMOVED*** await hnRequest('/newstories.json?print***REMOVED***pretty');
    const recentStories ***REMOVED*** stories.slice(0, 30);

    for (const id of recentStories) {
      const story ***REMOVED*** await hnRequest(`/item/${id}.json?print***REMOVED***pretty`);
      if (story.url ***REMOVED******REMOVED******REMOVED*** url) {
        warn(`\n⚠️  This URL was already posted!`);
        log(`    Story ID: ${story.id}`, colors.yellow);
        log(`    Score: ${story.score || 0} | Comments: ${story.descendants || 0}`);
        log(`    Link: ${HN_WEB_BASE}/item?id***REMOVED***${story.id}`);
        return { duplicate: true, existingId: story.id };
      }
    }

    success('\n✓ No duplicate posts found');
  } catch (e) {
    warn('Could not check for duplicates (API rate limit?)');
  }

  // Generate direct post URL
  const postUrl ***REMOVED*** `${HN_WEB_BASE}/submit?title***REMOVED***${encodeURIComponent(title)}&url***REMOVED***${encodeURIComponent(url)}`;

  log('\n***REMOVED******REMOVED******REMOVED*** Ready to Post ***REMOVED******REMOVED******REMOVED***', colors.bright);
  log('\nNote: HN requires authentication to post directly.', colors.yellow);
  log('Please open the following URL to complete your post:', colors.reset);
  log(`${postUrl}\n`, colors.bright + colors.green);

  log('Tips for success:', colors.cyan);
  log('  1. First comment: Add context, explain why it matters');
  log('  2. Engage with comments early');
  log('  3. Be authentic, avoid marketing speak');

  return { postUrl, title, url, timestamp: new Date().toISOString() };
}

/**
 * Track post performance
 */
async function trackPost(postId) {
  try {
    const item ***REMOVED*** await hnRequest(`/item/${postId}.json?print***REMOVED***pretty`);
    return {
      id: item.id,
      score: item.score || 0,
      comments: item.descendants || 0,
      url: `${HN_WEB_BASE}/item?id***REMOVED***${item.id}`,
      time: new Date(item.time * 1000).toISOString()
    };
  } catch (e) {
    error(`Could not fetch post ${postId}: ${e.message}`);
    return null;
  }
}

/**
 * CLI handler
 */
async function main() {
  const args ***REMOVED*** process.argv.slice(2);

  // Help
  if (args.includes('--help') || args.includes('-h')) {
    log('\nHN Auto-Poster - Post to Hacker News strategically\n', colors.bright);
    log('Usage:', colors.cyan);
    log('  node hn-poster.js post --title "Title" --url "https://..." [--text "Ask HN..."]');
    log('  node hn-poster.js track <post-id>');
    log('  node hn-poster.js best-time');
    log('  node hn-poster.js --help\n');
    log('Commands:', colors.green);
    log('  post       Create and preview a post (returns direct URL)');
    log('  track      Track performance of an existing post');
    log('  best-time  Show optimal posting times based on data');
    log('\nExamples:', colors.reset);
    log('  node hn-poster.js post --title "ReviewFlow: AI Code Review CLI" --url "https://github.com/..."');
    log('  node hn-poster.js track 12345678');
    log('  node hn-poster.js best-time\n');
    return;
  }

  const command ***REMOVED*** args[0];

  // Best time command
  if (command ***REMOVED******REMOVED******REMOVED*** 'best-time') {
    getBestTime();
    return;
  }

  // Track command
  if (command ***REMOVED******REMOVED******REMOVED*** 'track') {
    const postId ***REMOVED*** args[1];
    if (!postId) {
      error('Post ID required for tracking');
      log('Usage: node hn-poster.js track <post-id>', colors.cyan);
      return;
    }
    const result ***REMOVED*** await trackPost(postId);
    if (result) {
      log('\n***REMOVED******REMOVED******REMOVED*** Post Performance ***REMOVED******REMOVED******REMOVED***', colors.bright);
      log(`ID: ${result.id}`, colors.cyan);
      log(`Score: ${result.score}`, colors.green);
      log(`Comments: ${result.comments}`, colors.green);
      log(`URL: ${result.url}`, colors.reset);
      log(`Posted: ${result.time}\n`, colors.reset);
    }
    return;
  }

  // Post command
  if (command ***REMOVED******REMOVED******REMOVED*** 'post') {
    const titleIdx ***REMOVED*** args.indexOf('--title');
    const urlIdx ***REMOVED*** args.indexOf('--url');
    const textIdx ***REMOVED*** args.indexOf('--text');

    const title ***REMOVED*** titleIdx !***REMOVED******REMOVED*** -1 ? args[titleIdx + 1] : null;
    const url ***REMOVED*** urlIdx !***REMOVED******REMOVED*** -1 ? args[urlIdx + 1] : null;
    const text ***REMOVED*** textIdx !***REMOVED******REMOVED*** -1 ? args[textIdx + 1] : null;

    if (!title || !url) {
      error('Title and URL are required for posting');
      log('Usage: node hn-poster.js post --title "Title" --url "https://..."', colors.cyan);
      log('\nChecking optimal time...', colors.yellow);
      getBestTime();
      return;
    }

    await postToHN(title, url, text);
    return;
  }

  // No command - show help
  log('\nHN Auto-Poster\n', colors.bright);
  log('Run with --help for usage information\n', colors.cyan);
}

if (require.main ***REMOVED******REMOVED******REMOVED*** module) {
  main().catch(err ***REMOVED***> {
    error(err.message);
    process.exit(1);
  });
}

module.exports ***REMOVED*** { postToHN, trackPost, getBestTime, validatePost };
