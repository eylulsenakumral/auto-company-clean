/**
 * CSV Recipients Parser
 * Reads recipient data from CSV file
 */

import fs from 'fs';
import { parse } from 'csv-parse/sync';

export interface Recipient {
  email: string;
  name: string;
  segment?: string;
  personalizedOpener?: string;
  notes?: string;
}

export class RecipientsLoader {
  loadFromCsv(filePath: string): Recipient[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    const content ***REMOVED*** fs.readFileSync(filePath, 'utf-8');
    const records ***REMOVED*** parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const recipients: Recipient[] ***REMOVED*** [];

    for (const record of records) {
      // Validate email
      const email ***REMOVED*** record.email?.trim();
      if (!email || !this.isValidEmail(email)) {
        console.warn(`Skipping invalid email: ${email}`);
        continue;
      }

      recipients.push({
        email,
        name: record.name?.trim() || '',
        segment: record.segment?.trim(),
        personalizedOpener: record.personalizedOpener?.trim(),
        notes: record.notes?.trim()
      });
    }

    return recipients;
  }

  loadSingle(email: string, name: string ***REMOVED*** ''): Recipient[] {
    if (!this.isValidEmail(email)) {
      throw new Error(`Invalid email: ${email}`);
    }

    return [{ email, name }];
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  createSampleCsv(filePath: string, count: number ***REMOVED*** 1): void {
    const sampleData ***REMOVED*** [
      'email,name,segment,personalizedOpener,notes',
      ...Array.from({ length: count }, (_, i) ***REMOVED***> {
        const num ***REMOVED*** i + 1;
        return `test${num}@example.com,Test User ${num},inner_circle,,Sample recipient`;
      })
    ];

    fs.writeFileSync(filePath, sampleData.join('\n'), 'utf-8');
    console.log(`Created sample CSV with ${count} recipient(s) at ${filePath}`);
  }
}
