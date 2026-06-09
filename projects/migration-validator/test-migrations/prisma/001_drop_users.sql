-- Migration: Drop users table (DESTRUCTIVE)
-- Apply
DROP TABLE users;

-- Rollback
CREATE TABLE users (id SERIAL PRIMARY KEY);
