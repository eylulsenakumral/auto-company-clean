/**
 * Tests for leak detection using real code samples
 *
 * Known limitations:
 * - Release tracking (conn.release()) is not yet implemented
 * - Tests marked with @todo reflect planned improvements
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LeakDetector } from '../dist/detector.js';

describe('LeakDetector', () ***REMOVED***> {
  const detector ***REMOVED*** new LeakDetector();

  describe('pg - missing release', () ***REMOVED***> {
    it('should detect missing pool.connect() release', () ***REMOVED***> {
      const code ***REMOVED*** `
import { Pool } from 'pg';

const pool ***REMOVED*** new Pool();

async function getUser(id) {
  const conn ***REMOVED*** await pool.connect();
  const result ***REMOVED*** await conn.query('SELECT * FROM users WHERE id ***REMOVED*** $1', [id]);
  // Missing: conn.release()
  return result.rows[0];
}
`;
      const result ***REMOVED*** detector.analyze('test.ts', code);
      assert.strictEqual(result.issues.length, 1);
      assert.strictEqual(result.issues[0].type, 'exception-path');
    });

    it('should not flag when connection is released', () ***REMOVED***> {
      const code ***REMOVED*** `
import { Pool } from 'pg';

const pool ***REMOVED*** new Pool();

async function getUser(id) {
  const conn ***REMOVED*** await pool.connect();
  try {
    const result ***REMOVED*** await conn.query('SELECT * FROM users WHERE id ***REMOVED*** $1', [id]);
    return result.rows[0];
  } finally {
    conn.release();
  }
}
`;
      const result ***REMOVED*** detector.analyze('test.ts', code);
      assert.strictEqual(result.issues.length, 0);
    });
  });

  describe('pg - loop leaks', () ***REMOVED***> {
    it('should detect connection acquisition inside loop', () ***REMOVED***> {
      const code ***REMOVED*** `
async function processItems(items) {
  for (const item of items) {
    const conn ***REMOVED*** await pool.connect();
    await process(item);
    // Missing release in loop
  }
}
`;
      const result ***REMOVED*** detector.analyze('test.ts', code);
      assert(result.issues.length > 0);
      assert.strictEqual(result.issues[0].type, 'loop-leak');
    });

    it('should not flag when connection is outside loop', () ***REMOVED***> {
      const code ***REMOVED*** `
async function processItems(items) {
  const conn ***REMOVED*** await pool.connect();
  try {
    for (const item of items) {
      await process(item);
    }
  } finally {
    conn.release();
  }
}
`;
      const result ***REMOVED*** detector.analyze('test.ts', code);
      assert.strictEqual(result.issues.length, 0);
    });
  });

  describe('mysql2', () ***REMOVED***> {
    it('should detect missing getConnection release', () ***REMOVED***> {
      const code ***REMOVED*** `
async function query(sql) {
  const conn ***REMOVED*** await pool.getConnection();
  const result ***REMOVED*** await conn.query(sql);
  // Missing: conn.release()
  return result;
}
`;
      const result ***REMOVED*** detector.analyze('test.ts', code);
      assert(result.issues.length > 0);
    });
  });

  describe('Prisma', () ***REMOVED***> {
    it('should detect transaction without error handling', () ***REMOVED***> {
      const code ***REMOVED*** `
async function createUserWithPost() {
  await prisma.$transaction(async (tx) ***REMOVED***> {
    await tx.user.create({ data: { name: 'John' } });
    await tx.post.create({ data: { title: 'Hello' } });
  });
  // No error handling
}
`;
      const result ***REMOVED*** detector.analyze('test.ts', code);
      assert(result.issues.length > 0);
    });

    it('should not flag when transaction has try-catch', () ***REMOVED***> {
      const code ***REMOVED*** `
async function createUserWithPost() {
  try {
    await prisma.$transaction(async (tx) ***REMOVED***> {
      await tx.user.create({ data: { name: 'John' } });
      await tx.post.create({ data: { title: 'Hello' } });
    });
  } catch (error) {
    console.error(error);
  }
}
`;
      const result ***REMOVED*** detector.analyze('test.ts', code);
      assert.strictEqual(result.issues.length, 0);
    });
  });

  describe('edge cases', () ***REMOVED***> {
    it('should handle syntax errors gracefully', () ***REMOVED***> {
      const code ***REMOVED*** `
this is not valid typescript @#$%
`;
      const result ***REMOVED*** detector.analyze('test.ts', code);
      assert.strictEqual(result.issues.length, 0);
    });

    it('should handle empty files', () ***REMOVED***> {
      const code ***REMOVED*** '';
      const result ***REMOVED*** detector.analyze('test.ts', code);
      assert.strictEqual(result.issues.length, 0);
    });
  });
});
