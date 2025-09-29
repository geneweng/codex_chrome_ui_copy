import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

const SAMPLE_DETAIL_ID = 'f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42';

const mockDetail = {
  id: SAMPLE_DETAIL_ID,
  title: 'Sunrise Ridge Lookout',
  description: 'Mock description',
  coordinates: { latitude: 45.3265, longitude: -121.7112 },
  capturedAt: '2025-02-12T13:54:00Z',
  addedAt: '2025-02-14T18:00:00Z',
  verifiedAt: '2025-03-02T17:30:00Z',
  elevationM: 2685,
  status: 'published',
  author: { id: 'author-1', name: 'Alex Rivers' },
  media: [
    {
      id: 'media-1',
      type: 'photo',
      path: 'media/sunrise.jpg',
      width: 4000,
      height: 2600
    }
  ],
  tags: [
    { id: 'tag-sunrise', slug: 'sunrise', label: 'Sunrise' },
    { id: 'tag-mountain', slug: 'mountain', label: 'Mountain' }
  ],
  comments: []
};

const mockNearby = [
  { id: 'near-1', title: 'Mock Nearby Point', author: { name: 'Priya Chen' }, distanceM: 321, tags: mockDetail.tags }
];

const mockLatest = [
  { id: 'latest-1', title: 'Mock Latest Viewpoint', author: { name: 'Jordan Malik' }, addedAt: '2025-02-25T18:00:00Z', tags: mockDetail.tags }
];

const mockShared = [
  { id: 'shared-1', title: 'Shared Tag Spot', author: { name: 'Alex Rivers' }, tags: mockDetail.tags }
];

const apiResponseMap = new Map([
  [`/api/viewpoints/${SAMPLE_DETAIL_ID}`, mockDetail],
  ['/api/viewpoints?limit=5', { data: mockLatest }],
  [`/api/viewpoints?tag=sunrise&limit=5`, { data: mockShared }]
]);

test('sidebar renders viewpoint lists when filters change', async () => {
  const html = await readFile(path.join(projectRoot, 'index.html'), 'utf-8');
  const dom = new JSDOM(html, { url: 'http://localhost', pretendToBeVisual: true });

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.Node = dom.window.Node;
  global.HTMLElement = dom.window.HTMLElement;
  global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);

  window.API_BASE_URL = 'http://mock.api';
  window.MEDIA_BASE_URL = '';

  global.fetch = async (url) => {
    const normalized = typeof url === 'string' ? url : url.toString();
    if (normalized.startsWith(window.API_BASE_URL)) {
      const pathPart = normalized.slice(window.API_BASE_URL.length);
      if (pathPart.startsWith('/api/viewpoints?near_lat=')) {
        return {
          ok: true,
          json: async () => ({ data: mockNearby })
        };
      }
      if (apiResponseMap.has(pathPart)) {
        return {
          ok: true,
          json: async () => structuredClone(apiResponseMap.get(pathPart))
        };
      }
    }
    throw new Error(`Unexpected fetch in test: ${normalized}`);
  };

  const appModuleUrl = pathToFileURL(path.join(projectRoot, 'app.js')).href;
  await import(appModuleUrl);

  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  await new Promise((resolve) => setTimeout(resolve, 0));

  const list = dom.window.document.getElementById('filter-list');
  assert.ok(list.textContent.includes('Mock Nearby Point'));

  const latestButton = dom.window.document.querySelector('[data-filter="latest"]');
  latestButton.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.ok(list.textContent.includes('Mock Latest Viewpoint'));

  const sharedButton = dom.window.document.querySelector('[data-filter="shared"]');
  sharedButton.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.ok(list.textContent.includes('Shared Tag Spot'));
});
