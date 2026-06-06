#!/usr/bin/env node
/**
 * GitHub Outreach Script for ReviewFlow
 *
 * Automated outreach for relevant GitHub issues about code review, PR triage,
 * and AI code pain points. Non-spammy, value-first approach.
 *
 * Usage:
 *   node scripts/distribution/gh-outreach.cjs --dry-run
 *   node scripts/distribution/gh-outreach.cjs --execute
 *   node scripts/distribution/gh-outreach.cjs --filter "code review"
 *
 * Requirements:
 *   - GITHUB_TOKEN environment variable for execute mode
 *   - data/distribution/gh-issues.json must exist
 */

const fs ***REMOVED*** require('fs');
const path ***REMOVED*** require('path');
const { Octokit } ***REMOVED*** require('@octokit/rest');

// Configuration
const CONFIG ***REMOVED*** {
  issuesPath: path.join(__dirname, '../../data/distribution/gh-issues.json'),
  outputPath: path.join(__dirname, '../../data/distribution/outcome'),
  githubToken: process.env.GITHUB_TOKEN,
  repo: 'eylulsenakumral/reviewflow-cli',
  rateLimitDelay: 2000, // 2 seconds between requests
};

// Relevance filters - only these keywords are worth outreach
const RELEVANT_KEYWORDS ***REMOVED*** [
  'code review',
  'pr triage',
  'pull request automation',
  'ai slop',
  'code quality',
];

// Personalization templates based on issue context
const TEMPLATES ***REMOVED*** {
  // For general code review pain points
  codeReview: (repo, author) ***REMOVED***> `Hey! This hits on a real pain point we've been dealing with.

The AI coding bottleneck is real – teams suddenly have 10x the PR volume but the same review bandwidth. We built a CLI tool to triage PRs by risk level so you can focus on what actually matters.

It categorizes PRs into LOW/MEDIUM/HIGH risk based on file paths, diff size, and change patterns. Helps skip the AI-generated noise (typo fixes, imports, formatting) and focus on the risky stuff (logic changes, security touchpoints, breaking changes).

\`\`\`bash
npm install -g reviewflow
reviewflow pr:list ${repo}
\`\`\`

GitHub: https://github.com/${CONFIG.repo}

Not a perfect fit for every workflow, but might save you some review time if you're drowning in PRs. Worth a shot.

Hope this helps! If you try it and have feedback, issues are welcome on the repo.`,

  // For PR triage specifically
  prTriage: (repo, author) ***REMOVED***> `Hey! Saw this about PR triage and thought I'd share something we built.

We were drowning in PR volume and needed a way to quickly identify which ones actually needed human review. Built a CLI that triages PRs by risk level:

- **LOW**: Docs, formatting, typos (auto-approve)
- **MEDIUM**: Tests, small refactors (quick review)
- **HIGH**: Logic, security, breaking changes (full review)

\`\`\`bash
npm install -g reviewflow
reviewflow pr:list ${repo}
\`\`\`

GitHub: https://github.com/${CONFIG.repo}

Different from LLM-based review tools – more about signal filtering than code analysis. If you're dealing with AI-generated PR volume, might help prioritize what to review first.`,

  // For AI code / AI slop issues
  aiCode: (repo, author) ***REMOVED***> `Hey! Saw this issue about AI-generated code and thought I'd share a relevant tool.

The "AI slop" problem is real – suddenly there's 10x the code but the same review bandwidth. We built a CLI to triage PRs by risk so you can skip the noise:

- Skip: Formatting, imports, typo fixes, doc updates
- Quick scan: Tests, small refactorings
- Full review: Logic changes, security, breaking changes

\`\`\`bash
npm install -g reviewflow
reviewflow pr:list ${repo}
\`\`\`

GitHub: https://github.com/${CONFIG.repo}

Goal isn't to replace review, but to help focus human attention where it actually prevents disasters. Might be useful if you're dealing with AI-generated PR spam.`,

  // For code quality issues
  codeQuality: (repo, author) ***REMOVED***> `Hey! Saw this about code quality and thought I'd share something relevant.

We built a CLI to triage PRs by risk level – helps focus review effort on changes that actually matter. It categorizes PRs based on file paths, diff size, and change patterns:

- **LOW**: Safe changes (docs, formatting, imports)
- **MEDIUM**: Moderate risk (tests, refactorings)
- **HIGH**: Full review needed (logic, security, breaking changes)

\`\`\`bash
npm install -g reviewflow
reviewflow pr:list ${repo}
\`\`\`

GitHub: https://github.com/${CONFIG.repo}

Not a replacement for proper quality checks, but helps prioritize review bandwidth when you have lots of PRs in the queue.`,
};

/**
 * Determine which template to use based on issue context
 */
function selectTemplate(issue) {
  const { title, keyword } ***REMOVED*** issue;

  if (keyword.includes('triage') || title.toLowerCase().includes('triage')) {
    return 'prTriage';
  }
  if (keyword.includes('ai slop') || title.toLowerCase().includes('ai')) {
    return 'aiCode';
  }
  if (keyword.includes('code quality')) {
    return 'codeQuality';
  }
  // Default to code review
  return 'codeReview';
}

/**
 * Check if an issue is relevant for outreach
 */
function isRelevant(issue) {
  // Filter by keyword
  const keywordLower ***REMOVED*** issue.keyword.toLowerCase();
  const titleLower ***REMOVED*** issue.title.toLowerCase();

  return RELEVANT_KEYWORDS.some(kw ***REMOVED***>
    keywordLower.includes(kw) || titleLower.includes(kw)
  );
}

/**
 * Check if an issue should be skipped (bot-generated, already solved, etc.)
 */
function shouldSkip(issue) {
  // Skip bot-generated exercise issues
  if (issue.title.includes('Exercise:') || issue.author.includes('[bot]')) {
    return true;
  }

  // Skip if already has lots of comments (likely already discussed)
  if (issue.comments > 5) {
    return true;
  }

  // Skip very old issues (>6 months)
  const issueDate ***REMOVED*** new Date(issue.createdAt);
  const sixMonthsAgo ***REMOVED*** new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  if (issueDate < sixMonthsAgo) {
    return true;
  }

  return false;
}

/**
 * Filter issues to only relevant ones
 */
function filterIssues(issues) {
  return issues.filter(issue ***REMOVED***>
    isRelevant(issue) && !shouldSkip(issue)
  );
}

/**
 * Generate a personalized comment for an issue
 */
function generateComment(issue) {
  const templateName ***REMOVED*** selectTemplate(issue);
  const template ***REMOVED*** TEMPLATES[templateName];
  return template(issue.repository, issue.author);
}

/**
 * Load issues from JSON file
 */
function loadIssues() {
  try {
    const content ***REMOVED*** fs.readFileSync(CONFIG.issuesPath, 'utf8');
    const data ***REMOVED*** JSON.parse(content);
    return data.issues || [];
  } catch (error) {
    console.error(`Failed to load issues from ${CONFIG.issuesPath}:`, error.message);
    process.exit(1);
  }
}

/**
 * Extract owner/repo from GitHub issue URL
 */
function parseIssueUrl(url) {
  const match ***REMOVED*** url.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    issueNumber: parseInt(match[3], 10),
  };
}

/**
 * Post a comment to a GitHub issue
 */
async function postComment(octokit, owner, repo, issueNumber, body) {
  try {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Sleep for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve ***REMOVED***> setTimeout(resolve, ms));
}

/**
 * Main execution
 */
async function main() {
  const args ***REMOVED*** process.argv.slice(2);
  const dryRun ***REMOVED*** !args.includes('--execute');
  const customFilter ***REMOVED*** args.find(a ***REMOVED***> a.startsWith('--filter***REMOVED***'))
    ? args.find(a ***REMOVED***> a.startsWith('--filter***REMOVED***')).split('***REMOVED***')[1]
    : null;

  console.log('***REMOVED******REMOVED******REMOVED*** GitHub Outreach Script ***REMOVED******REMOVED******REMOVED***');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Issues: ${CONFIG.issuesPath}`);
  console.log('');

  // Load issues
  const allIssues ***REMOVED*** loadIssues();
  console.log(`Loaded ${allIssues.length} issues`);

  // Apply custom filter if provided
  let issues ***REMOVED*** allIssues;
  if (customFilter) {
    const filterLower ***REMOVED*** customFilter.toLowerCase();
    issues ***REMOVED*** allIssues.filter(i ***REMOVED***>
      i.keyword.toLowerCase().includes(filterLower) ||
      i.title.toLowerCase().includes(filterLower)
    );
    console.log(`Filtered to ${issues.length} issues matching "${customFilter}"`);
  }

  // Filter to relevant issues
  const relevantIssues ***REMOVED*** filterIssues(issues);
  console.log(`Relevant issues for outreach: ${relevantIssues.length}`);
  console.log('');

  if (relevantIssues.length ***REMOVED******REMOVED******REMOVED*** 0) {
    console.log('No relevant issues found for outreach.');
    return;
  }

  // Generate comments
  const comments ***REMOVED*** relevantIssues.map(issue ***REMOVED***> ({
    issue,
    comment: generateComment(issue),
    parsed: parseIssueUrl(issue.url),
  }));

  // In dry-run mode, just display what would be posted
  if (dryRun) {
    console.log('***REMOVED******REMOVED******REMOVED*** Comments to Post (Dry Run) ***REMOVED******REMOVED******REMOVED***\n');

    comments.forEach((item, index) ***REMOVED***> {
      console.log(`[${index + 1}/${comments.length}] ${item.issue.url}`);
      console.log(`Repository: ${item.issue.repository}`);
      console.log(`Author: ${item.issue.author}`);
      console.log(`Keyword: ${item.issue.keyword}`);
      console.log('---');
      console.log(item.comment);
      console.log('\n' + '***REMOVED***'.repeat(80) + '\n');
    });

    console.log(`Total: ${comments.length} comments ready to post`);
    console.log('');
    console.log('Run with --execute to actually post these comments.');
    return;
  }

  // Execute mode - actually post comments
  if (!CONFIG.githubToken) {
    console.error('ERROR: GITHUB_TOKEN environment variable required for execute mode');
    process.exit(1);
  }

  console.log('***REMOVED******REMOVED******REMOVED*** Posting Comments ***REMOVED******REMOVED******REMOVED***\n');

  const octokit ***REMOVED*** new Octokit({ auth: CONFIG.githubToken });
  const results ***REMOVED*** [];

  for (let i ***REMOVED*** 0; i < comments.length; i++) {
    const { issue, comment, parsed } ***REMOVED*** comments[i];

    if (!parsed) {
      console.log(`[${i + 1}/${comments.length}] SKIP: Could not parse URL: ${issue.url}`);
      results.push({ issue, status: 'skipped', reason: 'invalid URL' });
      continue;
    }

    console.log(`[${i + 1}/${comments.length}] Posting to ${parsed.owner}/${parsed.repo}#${parsed.issueNumber}...`);

    const result ***REMOVED*** await postComment(
      octokit,
      parsed.owner,
      parsed.repo,
      parsed.issueNumber,
      comment
    );

    if (result.success) {
      console.log(`  ✓ Comment posted successfully`);
      results.push({ issue, status: 'posted', url: issue.url });
    } else {
      console.log(`  ✗ Failed: ${result.error}`);
      results.push({ issue, status: 'failed', error: result.error });
    }

    // Rate limiting delay
    if (i < comments.length - 1) {
      await sleep(CONFIG.rateLimitDelay);
    }
  }

  // Summary
  console.log('\n***REMOVED******REMOVED******REMOVED*** Summary ***REMOVED******REMOVED******REMOVED***');
  const posted ***REMOVED*** results.filter(r ***REMOVED***> r.status ***REMOVED******REMOVED******REMOVED*** 'posted').length;
  const failed ***REMOVED*** results.filter(r ***REMOVED***> r.status ***REMOVED******REMOVED******REMOVED*** 'failed').length;
  const skipped ***REMOVED*** results.filter(r ***REMOVED***> r.status ***REMOVED******REMOVED******REMOVED*** 'skipped').length;

  console.log(`Posted: ${posted}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);

  // Save results
  const timestamp ***REMOVED*** new Date().toISOString().replace(/[:.]/g, '-');
  const resultsPath ***REMOVED*** path.join(CONFIG.outputPath, `outreach-${timestamp}.json`);

  fs.mkdirSync(CONFIG.outputPath, { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  console.log(`\nResults saved to: ${resultsPath}`);
}

// Run main function
main().catch(error ***REMOVED***> {
  console.error('Fatal error:', error);
  process.exit(1);
});
