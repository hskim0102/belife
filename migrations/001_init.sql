-- BeLife initial schema (PostgreSQL)
-- Run via: node scripts/init-db.mjs

CREATE TABLE IF NOT EXISTS posts (
  id           SERIAL PRIMARY KEY,
  slug         VARCHAR(191) NOT NULL UNIQUE,
  title        VARCHAR(255) NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('notice','activity')),
  published_at TIMESTAMPTZ NOT NULL,
  thumbnail    VARCHAR(500),
  excerpt      TEXT,
  body         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_posts_published_at ON posts (published_at DESC);
CREATE INDEX IF NOT EXISTS ix_posts_category    ON posts (category);

CREATE TABLE IF NOT EXISTS programs (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(191) NOT NULL UNIQUE,
  name        VARCHAR(255) NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('domestic','overseas','education')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  thumbnail   VARCHAR(500),
  description TEXT NOT NULL,
  body        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_programs_order    ON programs (sort_order);
CREATE INDEX IF NOT EXISTS ix_programs_category ON programs (category);

CREATE TABLE IF NOT EXISTS milestones (
  id      SERIAL PRIMARY KEY,
  year    SMALLINT NOT NULL,
  month   SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  content VARCHAR(500) NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_milestones_when ON milestones (year DESC, month DESC);

CREATE TABLE IF NOT EXISTS members (
  id         SERIAL PRIMARY KEY,
  group_name TEXT NOT NULL CHECK (group_name IN ('board','auditor','advisor','staff')),
  name       VARCHAR(100) NOT NULL,
  position   VARCHAR(100),
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_members_group_order ON members (group_name, sort_order);

CREATE TABLE IF NOT EXISTS impact_stats (
  id         SERIAL PRIMARY KEY,
  value      VARCHAR(50) NOT NULL,
  unit       VARCHAR(50),
  label      VARCHAR(200) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_impact_stats_order ON impact_stats (sort_order);

CREATE TABLE IF NOT EXISTS site_settings (
  id               SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  donation_bank    VARCHAR(100),
  donation_account VARCHAR(100),
  donation_holder  VARCHAR(100),
  contact_email    VARCHAR(255),
  phone_number     VARCHAR(50),
  address          VARCHAR(500)
);
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_programs_updated_at ON programs;
CREATE TRIGGER trg_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
