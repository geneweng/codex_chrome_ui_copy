import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../app.js';
import { getClient, closePool } from '../db.js';

let server;
let baseUrl;

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await closePool();
});

test('database contains seeded viewpoints', async () => {
  const client = await getClient();
  try {
    const { rows } = await client.query('SELECT COUNT(*)::int AS count FROM viewpoints WHERE status = $1', ['published']);
    assert.ok(rows[0].count > 0, 'expected published viewpoints in database');
  } finally {
    client.release();
  }
});

test('GET /api/viewpoints returns data', async () => {
  const response = await fetch(`${baseUrl}/api/viewpoints?limit=5`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length > 0, 'expected at least one viewpoint');
  assert.ok(body.data[0].id, 'expected viewpoint id');
});

test('GET /api/viewpoints/:id returns detail with tags and comments', async () => {
  const listResponse = await fetch(`${baseUrl}/api/viewpoints?limit=1`);
  const listBody = await listResponse.json();
  const sample = listBody.data[0];
  assert.ok(sample, 'expected sample viewpoint');

  const detailResponse = await fetch(`${baseUrl}/api/viewpoints/${sample.id}`);
  assert.equal(detailResponse.status, 200);
  const detail = await detailResponse.json();

  assert.equal(detail.id, sample.id);
  assert.ok(Array.isArray(detail.tags));
  assert.ok(detail.tags.length >= 0);
  assert.ok(Array.isArray(detail.comments));
});
