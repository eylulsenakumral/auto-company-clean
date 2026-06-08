#!/usr/bin/env node
/**
 * Email Sender CLI
 * Usage: npm run send -- --recipients <csv> --sequence <id> --limit <n> --dry-run
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// ANSI colors for terminal output
const clc ***REMOVED*** {
  bold: (text: string) ***REMOVED***> `\x1b[1m${text}\x1b[0m`,
  cyan: (text: string) ***REMOVED***> `\x1b[36m${text}\x1b[0m`,
  green: (text: string) ***REMOVED***> `\x1b[32m${text}\x1b[0m`,
  red: (text: string) ***REMOVED***> `\x1b[31m${text}\x1b[0m`,
  yellow: (text: string) ***REMOVED***> `\x1b[33m${text}\x1b[0m`,
  dim: (text: string) ***REMOVED***> `\x1b[2m${text}\x1b[0m`,
  underline: (text: string) ***REMOVED***> `\x1b[4m${text}\x1b[0m`
};

import { EmailSender } from './sender.js';
import { TemplateManager, type Recipient } from './templates.js';
import { RecipientsLoader } from './recipients.js';
import { AuditLogger } from './logger.js';

const __dirname ***REMOVED*** path.dirname(fileURLToPath(import.meta.url));
const RECIPIENTS_CSV ***REMOVED*** path.join(__dirname, '../recipients.csv');

interface CliArgs {
  recipients?: string;
  sequence?: number;
  limit?: number;
  dryRun: boolean;
}

function parseArgs(): CliArgs {
  const args ***REMOVED*** process.argv.slice(2);
  const result: CliArgs ***REMOVED*** { dryRun: false };

  for (let i ***REMOVED*** 0; i < args.length; i++) {
    const arg ***REMOVED*** args[i];

    if (arg ***REMOVED******REMOVED******REMOVED*** '--recipients' && args[i + 1]) {
      result.recipients ***REMOVED*** args[++i];
    } else if (arg ***REMOVED******REMOVED******REMOVED*** '--sequence' && args[i + 1]) {
      result.sequence ***REMOVED*** parseInt(args[++i], 10);
    } else if (arg ***REMOVED******REMOVED******REMOVED*** '--limit' && args[i + 1]) {
      result.limit ***REMOVED*** parseInt(args[++i], 10);
    } else if (arg ***REMOVED******REMOVED******REMOVED*** '--dry-run') {
      result.dryRun ***REMOVED*** true;
    } else if (arg ***REMOVED******REMOVED******REMOVED*** '--help' || arg ***REMOVED******REMOVED******REMOVED*** '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
${clc.bold('Email Sender CLI')}

${clc.underline('Usage:')}
  npm run send -- [options]

${clc.underline('Options:')}
  --recipients <file>    CSV file with recipients (default: recipients.csv)
  --sequence <id>        Template ID (1-4, default: 1)
  --limit <n>            Max emails to send (default: all)
  --dry-run              Simulate sending without actual API calls
  --help                 Show this help

${clc.underline('CSV Format:')}
  email,name,segment,personalizedOpener,notes
  user@example.com,John Doe,inner_circle,,Optional notes

${clc.underline('Templates:')}
  1 ***REMOVED*** Can You Help?              (warm contacts)
  2 ***REMOVED*** Problem-Solution           (professional network)
  3 ***REMOVED*** Founder-to-Network         (inner circle)
  4 ***REMOVED*** Follow-Up                  (48h later)

${clc.underline('Environment Variables:')}
  RESEND_API_KEY         Your Resend API key
  FROM_EMAIL             Sender email (default: onboarding@resend.me)
  FROM_NAME              Sender name
  RATE_LIMIT_MS          Rate limit in ms (default: 1000)
  MAX_RETRIES            Max retry attempts (default: 3)
`);
}

async function main() {
  const args ***REMOVED*** parseArgs();

  // Validate environment
  const apiKey ***REMOVED*** process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(clc.red('Error: RESEND_API_KEY not set'));
    console.error(clc.yellow('Create a .env file with RESEND_API_KEY***REMOVED***re_xxxxxxxxxxxxx'));
    process.exit(1);
  }

  const fromEmail ***REMOVED*** process.env.FROM_EMAIL || 'onboarding@resend.me';
  const fromName ***REMOVED*** process.env.FROM_NAME || 'Tolga from Resume Keyword Analyzer';
  const rateLimitMs ***REMOVED*** parseInt(process.env.RATE_LIMIT_MS || '1000', 10);
  const maxRetries ***REMOVED*** parseInt(process.env.MAX_RETRIES || '3', 10);

  // Load recipients
  const recipientsPath ***REMOVED*** args.recipients || RECIPIENTS_CSV;
  const loader ***REMOVED*** new RecipientsLoader();
  let recipients: Recipient[];

  try {
    recipients ***REMOVED*** loader.loadFromCsv(recipientsPath);
  } catch (error) {
    console.error(clc.red(`Failed to load recipients: ${error}`));

    // Offer to create sample
    if (!args.recipients && !fs.existsSync(RECIPIENTS_CSV)) {
      console.log(clc.yellow('\nCreating sample recipients.csv...'));
      loader.createSampleCsv(RECIPIENTS_CSV, 1);
      console.log(clc.green('Sample CSV created. Please edit recipients.csv with real data.'));
      return;
    }
    process.exit(1);
  }

  if (recipients.length ***REMOVED******REMOVED******REMOVED*** 0) {
    console.error(clc.red('No valid recipients found in CSV'));
    process.exit(1);
  }

  // Apply limit
  if (args.limit && args.limit < recipients.length) {
    recipients ***REMOVED*** recipients.slice(0, args.limit);
  }

  // Get template
  const templateId ***REMOVED*** args.sequence || 1;
  const templateManager ***REMOVED*** new TemplateManager();
  const template ***REMOVED*** templateManager.getTemplate(templateId);

  if (!template) {
    console.error(clc.red(`Invalid template ID: ${templateId}`));
    console.log(clc.yellow('Available templates: 1-4'));
    process.exit(1);
  }

  // Initialize sender and logger
  const sender ***REMOVED*** new EmailSender(apiKey, fromEmail, fromName, rateLimitMs, maxRetries);
  const logger ***REMOVED*** new AuditLogger();

  // Print summary
  console.log(clc.bold('\n╔════════════════════════════════════════════════════════╗'));
  console.log(clc.bold('║           Email Sender - Ready to Send                ║'));
  console.log(clc.bold('╚════════════════════════════════════════════════════════╝\n'));

  console.log(`${clc.cyan('Template:')} ${template.name} (ID: ${templateId})`);
  console.log(`${clc.cyan('Recipients:')} ${recipients.length}`);
  console.log(`${clc.cyan('From:')} ${fromName} <${fromEmail}>`);
  console.log(`${clc.cyan('Rate limit:')} ${rateLimitMs}ms`);
  console.log(`${clc.yellow('Mode:')} ${args.dryRun ? 'DRY RUN (no emails sent)' : 'LIVE (emails will be sent)'}\n`);

  // Send emails
  let successCount ***REMOVED*** 0;
  let failCount ***REMOVED*** 0;
  const startTime ***REMOVED*** Date.now();

  for (let i ***REMOVED*** 0; i < recipients.length; i++) {
    const recipient ***REMOVED*** recipients[i];
    const progress ***REMOVED*** `[${i + 1}/${recipients.length}]`;

    console.log(clc.dim(`\n${progress} Processing ${recipient.email}...`));

    const { subject, html } ***REMOVED*** templateManager.renderTemplate(template, recipient);

    const result ***REMOVED*** await sender.send(
      recipient.email,
      recipient.name,
      subject,
      html,
      (entry) ***REMOVED***> {
        entry.template_id ***REMOVED*** templateId;
        logger.log(entry);
      },
      args.dryRun
    );

    if (result.success) {
      successCount++;
      console.log(clc.green(`✓ Sent to ${recipient.email}`));
      if (args.dryRun) {
        console.log(clc.dim(`  (dry-run, message ID: ${result.messageId})`));
      } else {
        console.log(clc.dim(`  (message ID: ${result.messageId})`));
      }
    } else {
      failCount++;
      console.log(clc.red(`✗ Failed to send to ${recipient.email}`));
      console.log(clc.red(`  Error: ${result.error}`));
    }
  }

  // Print summary
  const duration ***REMOVED*** Date.now() - startTime;
  const stats ***REMOVED*** AuditLogger.getStats();

  console.log(clc.bold('\n═════════════════════════════════════════════════════════'));
  console.log(clc.bold('                        Summary                          '));
  console.log(clc.bold('═════════════════════════════════════════════════════════\n'));

  console.log(`${clc.cyan('Total:')} ${recipients.length}`);
  console.log(`${clc.green('Success:')} ${successCount}`);
  console.log(`${clc.red('Failed:')} ${failCount}`);
  console.log(`${clc.yellow('Duration:')} ${(duration / 1000).toFixed(1)}s`);
  console.log(`${clc.cyan('Log file:')} ${logger['logPath']}`);

  // Show today's stats
  const todayStats ***REMOVED*** AuditLogger.getStats();
  console.log(clc.dim(`\nToday's total: ${todayStats.total} | Success: ${todayStats.success} | Failed: ${todayStats.failed}\n`));

  if (!args.dryRun && failCount > 0) {
    console.log(clc.yellow('⚠ Some emails failed. Check the log file for details.'));
    process.exit(1);
  }
}

main().catch(error ***REMOVED***> {
  console.error(clc.red('\nFatal error:'), error);
  process.exit(1);
});
