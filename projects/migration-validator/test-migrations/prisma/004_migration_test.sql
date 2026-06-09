-- Migration: Test various operations
-- Apply

-- Destructive: DROP TABLE
DROP TABLE sessions;

-- Type change: ALTER TYPE
ALTER TABLE users ALTER COLUMN age TYPE INTEGER;

-- NOT NULL without DEFAULT (critical)
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NOT NULL;

-- Lock risk: Full table UPDATE
UPDATE users SET status ***REMOVED*** 'active';

-- Missing rollback comment
-- TODO: add rollback later
