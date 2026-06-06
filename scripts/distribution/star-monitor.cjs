#!/usr/bin/env node

/**
 * Star Monitoring Dashboard
 *
 * Track star counts across all our repos with daily delta reports.
 * Alerts on spikes (>5 stars/day).
 *
 * Usage:
 *   node star-monitor.js scan --owner "tolga-brk"
 *   node star-monitor.js report
 *   node star-monitor.js alert-threshold <number>
 *   node star-monitor.js --help
 */

const { execSync } ***REMOVED*** require('child_process');
const fs ***REMOVED*** require('fs');
const path ***REMOVED*** require('path');

// ANSI colors
const colors ***REMOVED*** {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
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
  log(`✓ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ ${message}`, colors.cyan);
}

// Data directory
const DATA_DIR ***REMOVED*** path.join(__dirname, '../../data/distribution');
const STARS_FILE ***REMOVED*** path.join(DATA_DIR, 'star-monitor.json');
const ALERT_THRESHOLD ***REMOVED*** 5;

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load star data
 */
function loadStarData() {
  ensureDataDir();
  if (fs.existsSync(STARS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STARS_FILE, 'utf8'));
    } catch (e) {
      warn('Could not load star data, starting fresh');
    }
  }
  return { repos: {}, lastUpdate: null, alertThreshold: ALERT_THRESHOLD };
}

/**
 * Save star data
 */
function saveStarData(data) {
  ensureDataDir();
  data.lastUpdate ***REMOVED*** new Date().toISOString();
  fs.writeFileSync(STARS_FILE, JSON.stringify(data, null, 2));
  success('Star data updated');
}

/**
 * Check if gh CLI is available
 */
function checkGhCLI() {
  try {
    execSync('gh --version', { encoding: 'utf8' });
    return true;
  } catch (e) {
    error('GitHub CLI not installed');
    log('Install: https://cli.github.com/', colors.cyan);
    return false;
  }
}

/**
 * Get all repos for an owner
 */
function getRepos(owner) {
  try {
    const cmd ***REMOVED*** `gh repo list ${owner} --limit 100 --json name,nameWithOwner,stargazerCount,updatedAt,isPrivate`;
    const result ***REMOVED*** execSync(cmd, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (e) {
    error(`Failed to fetch repos: ${e.message}`);
    return [];
  }
}

/**
 * Scan repos and update star counts
 */
function scanRepos(owner) {
  log('\n***REMOVED******REMOVED******REMOVED*** Star Monitor Scan ***REMOVED******REMOVED******REMOVED***', colors.bright);
  log(`Scanning repos for @${owner}...\n`, colors.reset);

  const repos ***REMOVED*** getRepos(owner);
  const data ***REMOVED*** loadStarData();
  const spikes ***REMOVED*** [];

  if (repos.length ***REMOVED******REMOVED******REMOVED*** 0) {
    warn('No repos found');
    return;
  }

  log(`Found ${repos.length} repositories\n`, colors.cyan);

  for (const repo of repos) {
    // Skip private repos
    if (repo.isPrivate) {
      continue;
    }

    const repoName ***REMOVED*** repo.nameWithOwner;
    const currentStars ***REMOVED*** repo.stargazerCount;
    const lastData ***REMOVED*** data.repos[repoName];

    // Calculate delta
    let delta ***REMOVED*** 0;
    let deltaDays ***REMOVED*** 1;

    if (lastData && lastData.history && lastData.history.length > 0) {
      const lastEntry ***REMOVED*** lastData.history[0];
      delta ***REMOVED*** currentStars - lastEntry.stars;
      const lastDate ***REMOVED*** new Date(lastEntry.timestamp);
      const now ***REMOVED*** new Date();
      deltaDays ***REMOVED*** Math.max(1, Math.ceil((now - lastDate) / (1000 * 60 * 60 * 24)));
    }

    // Initialize or update repo data
    if (!data.repos[repoName]) {
      data.repos[repoName] ***REMOVED*** { history: [] };
    }

    const entry ***REMOVED*** {
      stars: currentStars,
      timestamp: new Date().toISOString(),
      delta: delta,
      deltaDays: deltaDays
    };

    data.repos[repoName].history.unshift(entry);
    // Keep last 90 days of data
    if (data.repos[repoName].history.length > 90) {
      data.repos[repoName].history ***REMOVED*** data.repos[repoName].history.slice(0, 90);
    }
    data.repos[repoName].current ***REMOVED*** entry;

    // Display
    const deltaStr ***REMOVED*** delta >***REMOVED*** 0 ? `+${delta}` : delta;
    const color ***REMOVED*** delta > data.alertThreshold ? colors.green : (delta > 0 ? colors.cyan : colors.reset);

    log(`${repo.name}`, colors.bright);
    log(`  Stars: ${currentStars} | Delta: ${deltaStr} (last ${deltaDays} day${deltaDays > 1 ? 's' : ''})`, color);
    log(`  Updated: ${new Date(repo.updatedAt).toLocaleDateString()}\n`, colors.reset);

    // Check for spike
    if (delta >***REMOVED*** data.alertThreshold) {
      spikes.push({
        repo: repoName,
        delta: delta,
        current: currentStars,
        url: `https://github.com/${repoName}`
      });
    }
  }

  saveStarData(data);

  // Show alerts
  if (spikes.length > 0) {
    log('\n⚠️  SPIKE ALERT! ⚠️', colors.bright + colors.yellow);
    spikes.forEach(spike ***REMOVED***> {
      log(`  ${spike.repo}: +${spike.delta} stars (now: ${spike.current})`, colors.green);
      log(`  → ${spike.url}\n`, colors.blue);
    });
  } else {
    info('\nNo star spikes detected (>5/day)');
  }

  return { repos: data.repos, spikes };
}

/**
 * Generate daily report
 */
function generateReport() {
  const data ***REMOVED*** loadStarData();

  log('\n***REMOVED******REMOVED******REMOVED*** Star Monitor Daily Report ***REMOVED******REMOVED******REMOVED***', colors.bright);
  log(`Last Update: ${data.lastUpdate || 'Never'}`, colors.reset);
  log(`Alert Threshold: ${data.alertThreshold || ALERT_THRESHOLD} stars/day\n`, colors.cyan);

  if (Object.keys(data.repos).length ***REMOVED******REMOVED******REMOVED*** 0) {
    info('No repos tracked yet. Run scan first.');
    log('\nTo scan repos:', colors.cyan);
    log('  node star-monitor.js scan --owner "username"');
    return;
  }

  const summary ***REMOVED*** [];

  for (const [repoName, repoData] of Object.entries(data.repos)) {
    const current ***REMOVED*** repoData.current;
    const history ***REMOVED*** repoData.history || [];

    if (!current) continue;

    // Calculate totals
    const totalStars ***REMOVED*** current.stars;
    const firstEntry ***REMOVED*** history[history.length - 1];
    const totalGrowth ***REMOVED*** firstEntry ? totalStars - firstEntry.stars : 0;
    const daysTracked ***REMOVED*** history.length || 1;
    const avgGrowth ***REMOVED*** totalGrowth / daysTracked;

    summary.push({
      repo: repoName,
      stars: totalStars,
      growth: totalGrowth,
      avgGrowth: avgGrowth.toFixed(1),
      daysTracked: daysTracked
    });
  }

  // Sort by stars
  summary.sort((a, b) ***REMOVED***> b.stars - a.stars);

  log('\nRepository Summary:\n', colors.green);
  summary.forEach((s, i) ***REMOVED***> {
    log(`${i + 1}. ${s.repo}`, colors.cyan);
    log(`   Stars: ${s.stars} | Growth: +${s.growth} (${s.avgGrowth}/day avg)`, colors.reset);
  });

  // Calculate totals
  const totalStars ***REMOVED*** summary.reduce((sum, s) ***REMOVED***> sum + s.stars, 0);
  const totalGrowth ***REMOVED*** summary.reduce((sum, s) ***REMOVED***> sum + s.growth, 0);
  const totalGrowthAvg ***REMOVED*** (totalGrowth / Math.max(summary.length, 1)).toFixed(1);

  log('\n***REMOVED******REMOVED******REMOVED*** Totals ***REMOVED******REMOVED******REMOVED***', colors.bright);
  log(`Repos tracked: ${summary.length}`, colors.green);
  log(`Total stars: ${totalStars}`, colors.cyan);
  log(`Total growth: +${totalGrowth}`, colors.cyan);
  log(`Average growth per repo: ${totalGrowthAvg} stars/day\n`, colors.reset);

  // Trend analysis
  log('***REMOVED******REMOVED******REMOVED*** Growth Leaders (last 24h) ***REMOVED******REMOVED******REMOVED***', colors.bright);
  const yesterday ***REMOVED*** new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const recentGrowth ***REMOVED*** summary.map(s ***REMOVED***> {
    const repoData ***REMOVED*** data.repos[s.repo];
    const current ***REMOVED*** repoData.current;
    const prevDay ***REMOVED*** repoData.history.find(h ***REMOVED***> {
      const hDate ***REMOVED*** new Date(h.timestamp);
      return hDate < yesterday;
    });
    const dayGrowth ***REMOVED*** prevDay ? current.stars - prevDay.stars : 0;
    return { repo: s.repo, dayGrowth, current: current.stars };
  }).sort((a, b) ***REMOVED***> b.dayGrowth - a.dayGrowth);

  recentGrowth.slice(0, 5).forEach((r, i) ***REMOVED***> {
    if (r.dayGrowth > 0) {
      log(`${i + 1}. ${r.repo}: +${r.dayGrowth} (now: ${r.current})`, colors.green);
    }
  });

  log('\n');
}

/**
 * CLI handler
 */
async function main() {
  const args ***REMOVED*** process.argv.slice(2);

  // Help
  if (args.includes('--help') || args.includes('-h')) {
    log('\nStar Monitoring Dashboard - Track repo star growth\n', colors.bright);
    log('Usage:', colors.cyan);
    log('  node star-monitor.js scan --owner "username"');
    log('  node star-monitor.js report');
    log('  node star-monitor.js alert-threshold <number>');
    log('  node star-monitor.js --help\n');
    log('Commands:', colors.green);
    log('  scan              Scan and update star counts for all repos');
    log('  report            Generate daily summary report');
    log('  alert-threshold   Set spike alert threshold (default: 5)\n');
    log('Examples:', colors.reset);
    log('  node star-monitor.js scan --owner "tolga-brk"');
    log('  node star-monitor.js report');
    log('  node star-monitor.js alert-threshold 10\n');
    log('Requires: gh CLI (GitHub CLI) installed\n', colors.yellow);
    return;
  }

  const command ***REMOVED*** args[0];

  // Scan command
  if (command ***REMOVED******REMOVED******REMOVED*** 'scan') {
    if (!checkGhCLI()) {
      return;
    }

    const ownerIdx ***REMOVED*** args.indexOf('--owner');
    const owner ***REMOVED*** ownerIdx !***REMOVED******REMOVED*** -1 ? args[ownerIdx + 1] : null;

    if (!owner) {
      error('Owner required for scan');
      log('Usage: node star-monitor.js scan --owner "username"', colors.cyan);
      return;
    }

    scanRepos(owner);
    return;
  }

  // Report command
  if (command ***REMOVED******REMOVED******REMOVED*** 'report') {
    generateReport();
    return;
  }

  // Alert threshold command
  if (command ***REMOVED******REMOVED******REMOVED*** 'alert-threshold') {
    const threshold ***REMOVED*** parseInt(args[1]);
    if (isNaN(threshold) || threshold < 1) {
      error('Valid threshold required');
      log('Usage: node star-monitor.js alert-threshold <number>', colors.cyan);
      return;
    }

    const data ***REMOVED*** loadStarData();
    data.alertThreshold ***REMOVED*** threshold;
    saveStarData(data);
    success(`Alert threshold set to ${threshold} stars/day`);
    return;
  }

  // No command - show help
  log('\nStar Monitoring Dashboard\n', colors.bright);
  log('Run with --help for usage information\n', colors.cyan);
}

if (require.main ***REMOVED******REMOVED******REMOVED*** module) {
  main().catch(err ***REMOVED***> {
    error(err.message);
    process.exit(1);
  });
}

module.exports ***REMOVED*** { scanRepos, generateReport };
