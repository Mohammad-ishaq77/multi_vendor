-- Multi-role test/demo users: one login, several allowed roles.
-- JWT still carries a single active role per session; login validates the
-- requested role against role + allowed_roles.

ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_roles TEXT[] NOT NULL DEFAULT '{}';
