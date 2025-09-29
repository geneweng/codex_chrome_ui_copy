-- Schema for ViewPoint Explorer database
-- Requires PostgreSQL 14+ with PostGIS extension installed

BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS authors (
    id              UUID PRIMARY KEY,
    display_name    TEXT NOT NULL,
    email           CITEXT UNIQUE,
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS viewpoints (
    id              UUID PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    author_id       UUID NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
    geom            GEOMETRY(Point, 4326) NOT NULL,
    captured_at     TIMESTAMPTZ,
    added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at     TIMESTAMPTZ,
    elevation_m     NUMERIC(7,2),
    status          TEXT NOT NULL DEFAULT 'published',
    CONSTRAINT viewpoints_status_check CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_viewpoints_geom ON viewpoints USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_viewpoints_added_at ON viewpoints (added_at DESC);

CREATE TABLE IF NOT EXISTS media_assets (
    id              UUID PRIMARY KEY,
    viewpoint_id    UUID NOT NULL REFERENCES viewpoints(id) ON DELETE CASCADE,
    media_type      TEXT NOT NULL,
    storage_path    TEXT NOT NULL,
    mime_type       TEXT NOT NULL,
    width           INTEGER,
    height          INTEGER,
    duration_sec    NUMERIC(6,2),
    captured_at     TIMESTAMPTZ,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT media_assets_type_check CHECK (media_type IN ('photo', 'video'))
);

CREATE INDEX IF NOT EXISTS idx_media_assets_viewpoint ON media_assets (viewpoint_id, sort_order);

CREATE TABLE IF NOT EXISTS tags (
    id          UUID PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    label       TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS viewpoint_tags (
    viewpoint_id    UUID NOT NULL REFERENCES viewpoints(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (viewpoint_id, tag_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id              UUID PRIMARY KEY,
    viewpoint_id    UUID NOT NULL REFERENCES viewpoints(id) ON DELETE CASCADE,
    author_id       UUID REFERENCES authors(id) ON DELETE SET NULL,
    body            TEXT NOT NULL,
    visited_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          TEXT NOT NULL DEFAULT 'published',
    CONSTRAINT comments_status_check CHECK (status IN ('pending', 'published', 'hidden'))
);

CREATE INDEX IF NOT EXISTS idx_comments_viewpoint ON comments (viewpoint_id, created_at DESC);

CREATE TABLE IF NOT EXISTS comment_reactions (
    comment_id  UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    reaction    TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (comment_id, author_id),
    CONSTRAINT comment_reactions_type_check CHECK (reaction IN ('like', 'dislike', 'helpful'))
);

COMMIT;
