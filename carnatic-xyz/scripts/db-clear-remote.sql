-- Clear all table data on remote D1 so we can re-import from local.
-- Run: npx wrangler d1 execute carnatic-music-db --remote --file=scripts/db-clear-remote.sql
-- Deletes in FK-safe order (children before parents).

DELETE FROM annotations;
DELETE FROM answers;
DELETE FROM comments;
DELETE FROM compositions;
DELETE FROM raga_ratings;
DELETE FROM user_audios;
DELETE FROM user_progress;
DELETE FROM votes;
DELETE FROM questions;
DELETE FROM resources;
DELETE FROM composers;
DELETE FROM ragas;
