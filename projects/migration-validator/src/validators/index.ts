/**
 * Validation checks registry
 */

import type { Validator, MigrationFile, Issue, Severity, Category } from '../types.js';

export const VALIDATORS: Validator[] ***REMOVED*** [
  {
    name: 'destructive-drop',
    category: 'destructive',
    check: (migration: MigrationFile): Issue[] ***REMOVED***> {
      const issues: Issue[] ***REMOVED*** [];
      const { content, path, framework } ***REMOVED*** migration;
      const upperContent ***REMOVED*** content.toUpperCase();

      const patterns ***REMOVED*** [
        { regex: /DROP\s+TABLE/gi, name: 'DROP TABLE' },
        { regex: /DROP\s+COLUMN/gi, name: 'DROP COLUMN' },
        { regex: /DROP\s+INDEX/gi, name: 'DROP INDEX' },
        { regex: /TRUNCATE/gi, name: 'TRUNCATE' },
        { regex: /DELETE\s+FROM\s+\w+\s*(?!WHERE)/gi, name: 'DELETE without WHERE' }
      ];

      for (const pattern of patterns) {
        let match;
        while ((match ***REMOVED*** pattern.regex.exec(content)) !***REMOVED******REMOVED*** null) {
          issues.push({
            id: `destructive-${pattern.name.replace(/\s+/g, '-').toLowerCase()}-${match.index}`,
            severity: 'critical',
            category: 'destructive',
            message: `Destructive operation: ${pattern.name} - data loss risk`,
            file: path,
            line: getLineNumber(content, match.index),
            code: match[0],
            framework
          });
        }
      }

      return issues;
    }
  },

  {
    name: 'destructive-alter-type',
    category: 'destructive',
    check: (migration: MigrationFile): Issue[] ***REMOVED***> {
      const issues: Issue[] ***REMOVED*** [];
      const { content, path, framework } ***REMOVED*** migration;

      const patterns ***REMOVED*** [
        /ALTER\s+.*\s+TYPE\s+/gi,
        /MODIFY\s+.*\s+(?:BIGINT|VARCHAR|TEXT|JSON)/gi,
        /CHANGE\s+COLUMN/gi
      ];

      for (const regex of patterns) {
        let match;
        while ((match ***REMOVED*** regex.exec(content)) !***REMOVED******REMOVED*** null) {
          issues.push({
            id: `alter-type-${match.index}`,
            severity: 'critical',
            category: 'breaking-change',
            message: 'Type change detected - potential data conversion loss',
            file: path,
            line: getLineNumber(content, match.index),
            code: match[0],
            framework
          });
        }
      }

      return issues;
    }
  },

  {
    name: 'lock-risk-long-running',
    category: 'lock-risk',
    check: (migration: MigrationFile): Issue[] ***REMOVED***> {
      const issues: Issue[] ***REMOVED*** [];
      const { content, path, framework } ***REMOVED*** migration;

      // Patterns that suggest long-running operations
      const patterns ***REMOVED*** [
        { regex: /UPDATE\s+\w+\s+SET/gim, risk: 'Full table UPDATE' },
        { regex: /DELETE\s+FROM\s+\w+\s+WHERE/gim, risk: 'Large DELETE' },
        { regex: /ADD\s+(?:UNIQUE\s+)?INDEX/gim, risk: 'Index creation on large table' },
        { regex: /ALTER\s+TABLE.*ADD\s+FOREIGN\s+KEY/gim, risk: 'FK constraint requires table scan' }
      ];

      for (const pattern of patterns) {
        let match;
        while ((match ***REMOVED*** pattern.regex.exec(content)) !***REMOVED******REMOVED*** null) {
          issues.push({
            id: `lock-risk-${match.index}`,
            severity: 'warning',
            category: 'lock-risk',
            message: `Lock risk: ${pattern.risk} - may block writes`,
            file: path,
            line: getLineNumber(content, match.index),
            code: match[0],
            framework
          });
        }
      }

      return issues;
    }
  },

  {
    name: 'rollback-missing',
    category: 'rollback',
    check: (migration: MigrationFile): Issue[] ***REMOVED***> {
      const issues: Issue[] ***REMOVED*** [];
      const { content, path, framework, parsed } ***REMOVED*** migration;

      if (!parsed || parsed.down.length ***REMOVED******REMOVED******REMOVED*** 0) {
        issues.push({
          id: `rollback-missing-${path}`,
          severity: 'warning',
          category: 'rollback',
          message: 'Missing rollback definition - manual recovery required',
          file: path,
          framework
        });
      }

      // Check for placeholder rollback comments
      const placeholderPatterns ***REMOVED*** [
        /--\s*TODO.*rollback/gi,
        /#\s*TODO.*rollback/gi,
        /Rollback\s+requires\s+manual/i
      ];

      for (const regex of placeholderPatterns) {
        if (regex.test(content)) {
          issues.push({
            id: `rollback-placeholder-${path}`,
            severity: 'warning',
            category: 'rollback',
            message: 'Rollback is a placeholder - not production ready',
            file: path,
            framework
          });
        }
      }

      return issues;
    }
  },

  {
    name: 'data-integrity-fk',
    category: 'data-integrity',
    check: (migration: MigrationFile): Issue[] ***REMOVED***> {
      const issues: Issue[] ***REMOVED*** [];
      const { content, path, framework } ***REMOVED*** migration;

      // Check for dropping FK without data cleanup
      const dropFkPattern ***REMOVED*** /DROP\s+FOREIGN\s+KEY/gi;
      let match;
      while ((match ***REMOVED*** dropFkPattern.exec(content)) !***REMOVED******REMOVED*** null) {
        issues.push({
          id: `fk-drop-${match.index}`,
          severity: 'warning',
          category: 'data-integrity',
          message: 'Foreign Key dropped - orphaned records may exist',
          file: path,
          line: getLineNumber(content, match.index),
          code: match[0],
          framework
        });
      }

      // Check for NOT NULL addition without default
      const notNullPattern ***REMOVED*** /ADD\s+COLUMN.*NOT\s+NULL.*(?!DEFAULT)/gi;
      while ((match ***REMOVED*** notNullPattern.exec(content)) !***REMOVED******REMOVED*** null) {
        if (!match[0].includes('DEFAULT')) {
          issues.push({
            id: `not-null-no-default-${match.index}`,
            severity: 'critical',
            category: 'data-integrity',
            message: 'NOT NULL column without DEFAULT - fails on existing data',
            file: path,
            line: getLineNumber(content, match.index),
            code: match[0],
            framework
          });
        }
      }

      return issues;
    }
  },

  {
    name: 'index-impact',
    category: 'index-impact',
    check: (migration: MigrationFile): Issue[] ***REMOVED***> {
      const issues: Issue[] ***REMOVED*** [];
      const { content, path, framework } ***REMOVED*** migration;

      // Check for column additions without index recommendation
      const addColumnPattern ***REMOVED*** /ADD\s+COLUMN\s+(\w+)/gi;
      let match;
      while ((match ***REMOVED*** addColumnPattern.exec(content)) !***REMOVED******REMOVED*** null) {
        const columnName ***REMOVED*** match[1];

        // Look for index creation in the same migration
        const hasIndex ***REMOVED*** new RegExp(`CREATE.*INDEX.*\`${columnName}\`|CREATE.*INDEX.*${columnName}`, 'i').test(content);

        if (!hasIndex && !isSmallTable(content)) {
          issues.push({
            id: `index-missing-${match.index}`,
            severity: 'info',
            category: 'index-impact',
            message: `Column "${columnName}" added without index - consider for query performance`,
            file: path,
            line: getLineNumber(content, match.index),
            code: match[0],
            framework
          });
        }
      }

      return issues;
    }
  },

  {
    name: 'breaking-rename',
    category: 'breaking-change',
    check: (migration: MigrationFile): Issue[] ***REMOVED***> {
      const issues: Issue[] ***REMOVED*** [];
      const { content, path, framework } ***REMOVED*** migration;

      const patterns ***REMOVED*** [
        { regex: /RENAME\s+TABLE/gi, what: 'Table rename' },
        { regex: /RENAME\s+COLUMN/gi, what: 'Column rename' },
        { regex: /CHANGE\s+COLUMN/gi, what: 'Column rename/change' }
      ];

      for (const pattern of patterns) {
        let match;
        while ((match ***REMOVED*** pattern.regex.exec(content)) !***REMOVED******REMOVED*** null) {
          issues.push({
            id: `rename-${match.index}`,
            severity: 'critical',
            category: 'breaking-change',
            message: `${pattern.what} detected - application code updates required`,
            file: path,
            line: getLineNumber(content, match.index),
            code: match[0],
            framework
          });
        }
      }

      return issues;
    }
  },

  {
    name: 'performance-select-star',
    category: 'performance',
    check: (migration: MigrationFile): Issue[] ***REMOVED***> {
      const issues: Issue[] ***REMOVED*** [];
      const { content, path, framework } ***REMOVED*** migration;

      // Check for SELECT * in migrations (usually bad for data seeding)
      const selectStarPattern ***REMOVED*** /SELECT\s+\*/gi;
      let match;
      while ((match ***REMOVED*** selectStarPattern.exec(content)) !***REMOVED******REMOVED*** null) {
        issues.push({
          id: `select-star-${match.index}`,
          severity: 'info',
          category: 'performance',
          message: 'SELECT * detected - may fail if schema changes',
          file: path,
          line: getLineNumber(content, match.index),
          code: match[0],
          framework
        });
      }

      return issues;
    }
  }
];

function getLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length;
}

function isSmallTable(content: string): boolean {
  // Heuristic: if the migration looks like it's for a small/config table
  const smallTableIndicators ***REMOVED*** [
    /settings/i,
    /config/i,
    /migrations/i,
    /small/i
  ];

  return smallTableIndicators.some(pattern ***REMOVED***> pattern.test(content));
}

export function runValidators(migration: MigrationFile): Set<Category> {
  const checkedCategories ***REMOVED*** new Set<Category>();

  for (const validator of VALIDATORS) {
    checkedCategories.add(validator.category);
  }

  return checkedCategories;
}

export function validateMigration(migration: MigrationFile, ignorePatterns: string[] ***REMOVED*** []): Issue[] {
  const issues: Issue[] ***REMOVED*** [];

  for (const validator of VALIDATORS) {
    try {
      const foundIssues ***REMOVED*** validator.check(migration);
      for (const issue of foundIssues) {
        // Check if issue matches any ignore pattern
        const isIgnored ***REMOVED*** ignorePatterns.some(pattern ***REMOVED***> {
          const regex ***REMOVED*** new RegExp(pattern, 'i');
          return regex.test(issue.message) || regex.test(issue.category);
        });

        if (!isIgnored) {
          issues.push(issue);
        }
      }
    } catch (error) {
      // Validator failed - continue with others
    }
  }

  return issues;
}
