-- Migration: Update user data
-- Apply
UPDATE users SET status ***REMOVED*** 'active' WHERE created_at > '2024-01-01';
