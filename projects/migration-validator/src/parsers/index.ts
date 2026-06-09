/**
 * Parser registry and detector
 */

import type { MigrationFile, Framework, ParsedMigration } from '../types.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

import * as prisma from './prisma.js';
import * as django from './django.js';
import * as flyway from './flyway.js';
import * as rawSql from './raw-sql.js';

interface ParserModule {
  detect: (content: string, filename?: string) ***REMOVED***> boolean;
  parse: (content: string) ***REMOVED***> ParsedMigration;
  FRAMEWORK: Framework;
}

const PARSERS: ParserModule[] ***REMOVED*** [
  prisma as unknown as ParserModule,
  django as unknown as ParserModule,
  {
    FRAMEWORK: flyway.FRAMEWORK,
    detect: (c: string, f?: string) ***REMOVED***> flyway.detectFlyway(f || '', c),
    parse: flyway.parseFlyway
  },
  rawSql as unknown as ParserModule
];

export function detectFramework(content: string, filename: string ***REMOVED*** ''): Framework {
  for (const parser of PARSERS) {
    if (parser.detect(content, filename)) {
      return parser.FRAMEWORK;
    }
  }
  return 'unknown';
}

export function parseMigration(content: string, framework: Framework): ParsedMigration {
  const parser ***REMOVED*** PARSERS.find(p ***REMOVED***> p.FRAMEWORK ***REMOVED******REMOVED******REMOVED*** framework);
  if (!parser) {
    // Return raw lines as fallback
    const statements ***REMOVED*** content.split(';').map(s ***REMOVED***> s.trim()).filter(s ***REMOVED***> s);
    return { up: statements, down: [] };
  }
  return parser.parse(content);
}

const SQL_EXTENSIONS ***REMOVED*** ['.sql', '.prisma', '.ts', '.js', '.py'];

export function isMigrationFile(filename: string): boolean {
  const ext ***REMOVED*** extname(filename).toLowerCase();
  if (!SQL_EXTENSIONS.includes(ext)) return false;

  // Get just the basename, not the full path
  const base ***REMOVED*** basename(filename).toLowerCase();
  // Common migration patterns
  return base.includes('migration') ||
         /^\d+_/.test(base) || // 001_, 20240101_
         /^v\d+__/.test(base) || // V1__, V2.1__ (Flyway)
         base.includes('migrate');
}

export function loadMigrations(dir: string): MigrationFile[] {
  const migrations: MigrationFile[] ***REMOVED*** [];

  function scanDir(currentPath: string) {
    try {
      const entries ***REMOVED*** readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath ***REMOVED*** join(currentPath, entry.name);

        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && isMigrationFile(entry.name)) {
          try {
            const content ***REMOVED*** readFileSync(fullPath, 'utf-8');
            const framework ***REMOVED*** detectFramework(content, entry.name);
            const parsed ***REMOVED*** parseMigration(content, framework);

            migrations.push({
              path: fullPath,
              framework,
              content,
              parsed
            });
          } catch (error) {
            // Skip unreadable files
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  try {
    const stat ***REMOVED*** statSync(dir);
    if (stat.isDirectory()) {
      scanDir(dir);
    }
  } catch (error) {
    // Directory doesn't exist or isn't accessible
  }

  return migrations;
}
