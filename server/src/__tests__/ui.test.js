import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const runUiTest = process.env.RUN_UI_TESTS === '1';

if (!runUiTest) {
  test('sidebar renders viewpoint lists when filters change', (t) =>
    t.skip('Set RUN_UI_TESTS=1 to enable UI integration test.'));
} else {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../../../');

  const SAMPLE_DETAIL_ID = 'f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42';

  const clone = global.structuredClone ?? ((value) => JSON.parse(JSON.stringify(value)));

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

  test('sidebar renders viewpoint lists when filters change', async () => {
    const html = await readFile(path.join(projectRoot, 'index.html'), 'utf-8');
    const dom = new JSDOM(html, { url: 'http://localhost', pretendToBeVisual: true });

    global.window = dom.window;
    global.document = dom.window.document;
    Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
    global.Node = dom.window.Node;
    global.HTMLElement = dom.window.HTMLElement;
    global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);

    window.API_BASE_URL = 'http://mock.api';
    window.MEDIA_BASE_URL = '';

    global.fetch = async (input) => {
      let normalized;
      if (typeof input === 'string') {
        normalized = input;
      } else if (input && typeof input === 'object') {
        normalized = input.url || (input.href ? input.href : String(input));
      } else {
        normalized = String(input);
      }

      if (normalized.startsWith(window.API_BASE_URL)) {
        return { ok: false, status: 500, json: async () => ({}) };
      }
      if (normalized.includes('sample-data.json')) {
        return {
          ok: true,
          json: async () => ({
            detail: mockDetail,
            nearby: mockNearby,
            latest: mockLatest,
            shared: mockShared,
            sharedSummary: '#sunrise · #mountain'
          })
        };
      }
      throw new Error(`Unexpected fetch in test: ${normalized}`);
    };

    const appModuleUrl = pathToFileURL(path.join(projectRoot, 'app.js')).href;
    await import(appModuleUrl);

    if (typeof dom.window.__loadSampleData === 'function') {
      await dom.window.__loadSampleData();
    } else {
      dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
    }

    const list = dom.window.document.getElementById('filter-list');
    await waitFor(() => list.children.length > 0);
    assert.ok(list.textContent.trim().length > 0, 'expected nearby list to have content');

    const latestButton = dom.window.document.querySelector('[data-filter="latest"]');
    latestButton.click();
    await waitFor(() => list.children.length > 0);
    assert.ok(list.textContent.trim().length > 0, 'expected latest list to have content');

    const sharedButton = dom.window.document.querySelector('[data-filter="shared"]');
    sharedButton.click();
    await waitFor(() => list.children.length > 0);
    assert.ok(list.textContent.trim().length > 0, 'expected shared list to have content');
  });

  async function waitFor(predicate, timeout = 1500, interval = 20) {
    const start = Date.now();
    while (!predicate()) {
      if (Date.now() - start > timeout) {
        throw new Error('waitFor timed out');
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
}
