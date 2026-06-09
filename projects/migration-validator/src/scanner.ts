/**
 * Main scanner - orchestrates parsing and validation
 */

import type { ScanResult, Config, Category, Framework } from './types.js';
import { DEFAULT_CONFIG } from './types.js';
import { loadMigrations, detectFramework } from './parsers/index.js';
import { validateMigration } from './validators/index.js';
import { resolve } from 'path';
import { readFileSync } from 'fs';

export function scan(paths: string[] ***REMOVED*** [], config: Config ***REMOVED*** DEFAULT_CONFIG): ScanResult {
  const scanPaths ***REMOVED*** paths.length > 0 ? paths : (config.paths || ['./migrations', './prisma/migrations']);
  const ignorePatterns ***REMOVED*** config.ignore || [];

  let allMigrations: any[] ***REMOVED*** [];
  let detectedFramework: Framework ***REMOVED*** 'unknown';

  for (const path of scanPaths) {
    const migrations ***REMOVED*** loadMigrations(resolve(process.cwd(), path));
    allMigrations.push(...migrations);

    // Detect framework from first migration
    if (detectedFramework ***REMOVED******REMOVED******REMOVED*** 'unknown' && migrations.length > 0) {
      detectedFramework ***REMOVED*** detectFramework(migrations[0].content, migrations[0].path);
    }
  }

  // Use configured framework if specified
  if (config.framework && config.framework !***REMOVED******REMOVED*** 'unknown') {
    detectedFramework ***REMOVED*** config.framework;
  }

  const issues: any[] ***REMOVED*** [];
  const byCategory: Record<string, number> ***REMOVED*** {};

  for (const migration of allMigrations) {
    const migrationIssues ***REMOVED*** validateMigration(migration, ignorePatterns);

    // Map severity from config
    for (const issue of migrationIssues) {
      const configuredSeverity ***REMOVED*** getConfiguredSeverity(issue.category, config);
      issues.push({ ...issue, severity: configuredSeverity });
    }
  }

  // Build summary
  const summary ***REMOVED*** {
    total: issues.length,
    critical: issues.filter(i ***REMOVED***> i.severity ***REMOVED******REMOVED******REMOVED*** 'critical').length,
    warning: issues.filter(i ***REMOVED***> i.severity ***REMOVED******REMOVED******REMOVED*** 'warning').length,
    info: issues.filter(i ***REMOVED***> i.severity ***REMOVED******REMOVED******REMOVED*** 'info').length,
    byCategory: issues.reduce((acc, i) ***REMOVED***> {
      acc[i.category] ***REMOVED*** (acc[i.category] || 0) + 1;
      return acc;
    }, {} as Record<Category, number>)
  };

  return {
    framework: detectedFramework,
    files: allMigrations,
    issues,
    summary,
    timestamp: new Date().toISOString()
  };
}

function getConfiguredSeverity(category: Category, config: Config): 'critical' | 'warning' | 'info' {
  if (config.severity.critical.includes(category)) return 'critical';
  if (config.severity.warning.includes(category)) return 'warning';
  return 'info';
}

export function reportFromJson(jsonPath: string): ScanResult {
  const content ***REMOVED*** readFileSync(jsonPath, 'utf-8');
  return JSON.parse(content);
}
