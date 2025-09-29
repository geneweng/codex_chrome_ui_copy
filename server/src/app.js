import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db.js';
import { mapViewpointRow, mapViewpointDetailRow } from './mappers.js';

dotenv.config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : undefined;

app.use(cors({ origin: allowedOrigins || true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const buildViewpointListQuery = (filters, params, options = {}) => {
  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const limitParam = params.length + 1;
  const offsetParam = params.length + 2;

  const distanceSelect = options.distanceIndices
    ? `, ST_Distance(b.geom::geography, ST_SetSRID(ST_MakePoint($${options.distanceIndices.lng}, $${options.distanceIndices.lat}), 4326)::geography) AS distance_m`
    : '';

  return `
    WITH base AS (
      SELECT
        v.id,
        v.title,
        v.description,
        v.geom,
        v.captured_at,
        v.added_at,
        v.verified_at,
        v.elevation_m,
        v.status,
        a.display_name AS author_name,
        a.id AS author_id,
        ST_Y(v.geom) AS latitude,
        ST_X(v.geom) AS longitude
      FROM viewpoints v
      JOIN authors a ON a.id = v.author_id
      ${whereClause}
      ORDER BY v.added_at DESC
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
    ),
    media AS (
      SELECT ma.viewpoint_id,
             json_agg(
               jsonb_build_object(
                 'id', ma.id,
                 'type', ma.media_type,
                 'path', ma.storage_path,
                 'mimeType', ma.mime_type,
                 'width', ma.width,
                 'height', ma.height,
                 'durationSec', ma.duration_sec,
                 'capturedAt', ma.captured_at,
                 'sortOrder', ma.sort_order
               ) ORDER BY ma.sort_order
             ) AS assets
      FROM media_assets ma
      WHERE ma.viewpoint_id IN (SELECT id FROM base)
      GROUP BY ma.viewpoint_id
    ),
    tag_data AS (
      SELECT vt.viewpoint_id,
             json_agg(
               jsonb_build_object('id', t.id, 'slug', t.slug, 'label', t.label)
               ORDER BY t.label
             ) AS tags
      FROM viewpoint_tags vt
      JOIN tags t ON t.id = vt.tag_id
      WHERE vt.viewpoint_id IN (SELECT id FROM base)
      GROUP BY vt.viewpoint_id
    )
    SELECT
      b.id,
      b.title,
      b.description,
      b.author_id,
      b.author_name,
      b.latitude,
      b.longitude,
      b.captured_at,
      b.added_at,
      b.verified_at,
      b.elevation_m,
      b.status,
      COALESCE(m.assets, '[]'::json) AS media,
      COALESCE(t.tags, '[]'::json) AS tags
      ${distanceSelect}
    FROM base b
    LEFT JOIN media m ON m.viewpoint_id = b.id
    LEFT JOIN tag_data t ON t.viewpoint_id = b.id
    ORDER BY b.added_at DESC;
  `;
};

app.get('/api/viewpoints', async (req, res) => {
  try {
    const filters = ["v.status = 'published'"];
    const params = [];

    const nearLat = req.query.near_lat ? Number(req.query.near_lat) : null;
    const nearLng = req.query.near_lng ? Number(req.query.near_lng) : null;
    const radius = req.query.radius ? Number(req.query.radius) : null;

    let distanceIndices = null;
    if (Number.isFinite(nearLat) && Number.isFinite(nearLng)) {
      const dist = Number.isFinite(radius) ? radius : 5000; // meters
      const baseIndex = params.length;
      params.push(nearLng, nearLat, dist);
      const lngIdx = baseIndex + 1;
      const latIdx = baseIndex + 2;
      const radiusIdx = baseIndex + 3;
      distanceIndices = { lng: lngIdx, lat: latIdx };
      filters.push(`ST_DWithin(v.geom::geography, ST_SetSRID(ST_MakePoint($${lngIdx}, $${latIdx}), 4326)::geography, $${radiusIdx})`);
    }

    if (req.query.tag) {
      params.push(req.query.tag);
      const paramIdx = params.length;
      filters.push(`EXISTS (SELECT 1 FROM viewpoint_tags vt JOIN tags t ON t.id = vt.tag_id WHERE vt.viewpoint_id = v.id AND t.slug = $${paramIdx})`);
    }

    const limit = Math.min(Number.parseInt(req.query.limit ?? '12', 10), 50);
    const offset = Math.max(Number.parseInt(req.query.offset ?? '0', 10), 0);

    params.push(limit, offset);

    const sql = buildViewpointListQuery(filters, params.slice(0, -2), { distanceIndices });
    const { rows } = await query(sql, params);

    res.json({
      data: rows.map(mapViewpointRow),
      paging: {
        limit,
        offset,
        count: rows.length
      }
    });
  } catch (err) {
    console.error('Failed to list viewpoints', err);
    res.status(500).json({ error: 'Failed to list viewpoints' });
  }
});

app.get('/api/viewpoints/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      WITH base AS (
        SELECT
          v.id,
          v.title,
          v.description,
          v.geom,
          v.captured_at,
          v.added_at,
          v.verified_at,
          v.elevation_m,
          v.status,
          a.display_name AS author_name,
          a.id AS author_id,
          ST_Y(v.geom) AS latitude,
          ST_X(v.geom) AS longitude
        FROM viewpoints v
        JOIN authors a ON a.id = v.author_id
        WHERE v.id = $1
      ),
      media AS (
        SELECT ma.viewpoint_id,
               json_agg(
                 jsonb_build_object(
                   'id', ma.id,
                   'type', ma.media_type,
                   'path', ma.storage_path,
                   'mimeType', ma.mime_type,
                   'width', ma.width,
                   'height', ma.height,
                   'durationSec', ma.duration_sec,
                   'capturedAt', ma.captured_at,
                   'sortOrder', ma.sort_order
                 ) ORDER BY ma.sort_order
               ) AS assets
        FROM media_assets ma
        WHERE ma.viewpoint_id = $1
        GROUP BY ma.viewpoint_id
      ),
      tag_data AS (
        SELECT vt.viewpoint_id,
               json_agg(
                 jsonb_build_object('id', t.id, 'slug', t.slug, 'label', t.label)
                 ORDER BY t.label
               ) AS tags
        FROM viewpoint_tags vt
        JOIN tags t ON t.id = vt.tag_id
        WHERE vt.viewpoint_id = $1
        GROUP BY vt.viewpoint_id
      ),
      comment_data AS (
        SELECT c.viewpoint_id,
               json_agg(
                 jsonb_build_object(
                   'id', c.id,
                   'body', c.body,
                   'visitedAt', c.visited_at,
                   'createdAt', c.created_at,
                   'status', c.status,
                   'author', CASE WHEN a.id IS NOT NULL THEN jsonb_build_object('id', a.id, 'name', a.display_name) ELSE NULL END
                 ) ORDER BY c.created_at DESC
               ) AS comments
        FROM comments c
        LEFT JOIN authors a ON a.id = c.author_id
        WHERE c.viewpoint_id = $1 AND c.status = 'published'
        GROUP BY c.viewpoint_id
      )
      SELECT
        b.id,
        b.title,
        b.description,
        b.author_id,
        b.author_name,
        b.latitude,
        b.longitude,
        b.captured_at,
        b.added_at,
        b.verified_at,
        b.elevation_m,
        b.status,
        COALESCE(m.assets, '[]'::json) AS media,
        COALESCE(t.tags, '[]'::json) AS tags,
        COALESCE(cd.comments, '[]'::json) AS comments
      FROM base b
      LEFT JOIN media m ON m.viewpoint_id = b.id
      LEFT JOIN tag_data t ON t.viewpoint_id = b.id
      LEFT JOIN comment_data cd ON cd.viewpoint_id = b.id;
    `;

    const { rows } = await query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Viewpoint not found' });
    }

    res.json(mapViewpointDetailRow(rows[0]));
  } catch (err) {
    console.error('Failed to fetch viewpoint', err);
    res.status(500).json({ error: 'Failed to fetch viewpoint' });
  }
});

export default app;
