#!/usr/bin/env node

/**
 * npm Download Tracker for ReviewFlow CLI
 * Tracks weekly downloads and growth rate
 * Usage: node scripts/distribution/npm-tracker.cjs
 */

const https ***REMOVED*** require('https');
const fs ***REMOVED*** require('fs');
const path ***REMOVED*** require('path');

const PACKAGE_NAME ***REMOVED*** 'reviewflow';
const API_BASE ***REMOVED*** 'https://api.npmjs.org/versions';
const DATA_DIR ***REMOVED*** path.join(__dirname, '../../data/distribution');
const METRICS_FILE ***REMOVED*** path.join(DATA_DIR, 'npm-metrics.json');
const BASELINE_FILE ***REMOVED*** path.join(DATA_DIR, 'baseline-week2.json');

/**
 * Fetch npm download data from API
 */
function fetchDownloads(pkg) {
  return new Promise((resolve, reject) ***REMOVED***> {
    const url ***REMOVED*** `${API_BASE}/${pkg}/last-week`;

    https.get(url, (res) ***REMOVED***> {
      let data ***REMOVED*** '';

      res.on('data', (chunk) ***REMOVED***> {
        data +***REMOVED*** chunk;
      });

      res.on('end', () ***REMOVED***> {
        try {
          const parsed ***REMOVED*** JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Failed to parse API response: ${err.message}`));
        }
      });
    }).on('error', (err) ***REMOVED***> {
      reject(new Error(`API request failed: ${err.message}`));
    });
  });
}

/**
 * Calculate total downloads from version data
 */
function calculateTotalDownloads(data) {
  if (!data.downloads) return 0;
  return Object.values(data.downloads).reduce((sum, val) ***REMOVED***> sum + val, 0);
}

/**
 * Calculate growth percentage
 */
function calculateGrowth(current, baseline) {
  if (!baseline || baseline ***REMOVED******REMOVED******REMOVED*** 0) return '+0%';
  const growth ***REMOVED*** ((current - baseline) / baseline) * 100;
  if (growth ***REMOVED******REMOVED******REMOVED*** 0) return '+0%';
  return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
}

/**
 * Load existing baseline data
 */
function loadBaseline() {
  if (fs.existsSync(BASELINE_FILE)) {
    try {
      const data ***REMOVED*** fs.readFileSync(BASELINE_FILE, 'utf8');
      const parsed ***REMOVED*** JSON.parse(data);
      // Handle array format (history) - return first entry's downloads
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0].downloads || 0;
      }
      // Legacy object format
      return parsed.baseline || 0;
    } catch (err) {
      console.warn(`Warning: Could not read baseline file: ${err.message}`);
    }
  }
  return 0;
}

/**
 * Append to baseline history
 */
function appendBaseline(metrics) {
  let history ***REMOVED*** [];

  if (fs.existsSync(BASELINE_FILE)) {
    try {
      const data ***REMOVED*** fs.readFileSync(BASELINE_FILE, 'utf8');
      const parsed ***REMOVED*** JSON.parse(data);
      // Handle both array format and legacy object format
      history ***REMOVED*** Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn(`Warning: Could not parse baseline history: ${err.message}`);
    }
  }

  history.push({
    timestamp: metrics.timestamp,
    downloads: metrics.lastWeek,
    growth: metrics.growth
  });

  fs.writeFileSync(BASELINE_FILE, JSON.stringify(history, null, 2));
  console.log(`Baseline recorded: ${BASELINE_FILE}`);
}

/**
 * Save metrics to file
 */
function saveMetrics(metrics) {
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  console.log(`Metrics saved: ${METRICS_FILE}`);
}

/**
 * Display metrics summary
 */
function displaySummary(metrics, previousBaseline) {
  console.log('\n' + '***REMOVED***'.repeat(50));
  console.log(`npm Download Tracker - ${PACKAGE_NAME}`);
  console.log('***REMOVED***'.repeat(50));
  console.log(`Last Week Downloads: ${metrics.lastWeek}`);
  console.log(`Previous Baseline:   ${previousBaseline}`);
  console.log(`Growth Rate:         ${metrics.growth}`);
  console.log(`Timestamp:           ${metrics.timestamp}`);
  console.log('***REMOVED***'.repeat(50) + '\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log(`Fetching downloads for ${PACKAGE_NAME}...`);

    const downloadData ***REMOVED*** await fetchDownloads(PACKAGE_NAME);
    const totalDownloads ***REMOVED*** calculateTotalDownloads(downloadData);
    const previousBaseline ***REMOVED*** loadBaseline();
    const growth ***REMOVED*** calculateGrowth(totalDownloads, previousBaseline);

    const metrics ***REMOVED*** {
      package: PACKAGE_NAME,
      lastWeek: totalDownloads,
      growth: growth,
      timestamp: new Date().toISOString(),
      baseline: previousBaseline
    };

    displaySummary(metrics, previousBaseline);
    saveMetrics(metrics);
    appendBaseline(metrics);

  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
