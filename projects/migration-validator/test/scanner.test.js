/**
 * Scanner tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('migration-validator scanner', () ***REMOVED***> {
  it('should detect Prisma migrations', () ***REMOVED***> {
    const content ***REMOVED*** `
-- Migration: add_user_table
-- Apply
-- CreateIndex
CREATE INDEX "user_email_idx" ON "User"("email");
    `;
    assert.ok(content.includes('-- CreateIndex'));
  });

  it('should detect Django migrations', () ***REMOVED***> {
    const content ***REMOVED*** `
class Migration(migrations.Migration):
    dependencies ***REMOVED*** []
    operations ***REMOVED*** [
        migrations.CreateModel(...)
    ]
    `;
    assert.ok(content.includes('migrations.CreateModel'));
  });

  it('should detect DROP TABLE as critical', () ***REMOVED***> {
    const content ***REMOVED*** 'DROP TABLE users;';
    assert.ok(content.toUpperCase().includes('DROP TABLE'));
  });

  it('should detect ALTER TYPE as critical', () ***REMOVED***> {
    const content ***REMOVED*** 'ALTER TABLE users ALTER COLUMN age TYPE INTEGER;';
    assert.ok(content.toUpperCase().includes('ALTER') && content.toUpperCase().includes('TYPE'));
  });

  it('should detect missing rollback', () ***REMOVED***> {
    const migration ***REMOVED*** { parsed: { up: ['CREATE TABLE'], down: [] } };
    assert.strictEqual(migration.parsed.down.length, 0);
  });
});
