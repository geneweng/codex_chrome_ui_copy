const API_BASE_URL = window.API_BASE_URL || '';
const MEDIA_BASE_URL = window.MEDIA_BASE_URL || '';
const DEFAULT_VIEWPOINT_ID = 'f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42';

const state = {
  detail: null,
  nearby: null,
  shared: null,
  sharedSummary: '',
  latest: null,
  activeFilter: 'nearby',
  useSample: false,
  handlersAttached: false
};

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

const formatCoordinate = (value, positiveSuffix, negativeSuffix) => {
  if (!Number.isFinite(value)) {
    return '—';
  }
  const suffix = value >= 0 ? positiveSuffix : negativeSuffix;
  return `${Math.abs(value).toFixed(4)}° ${suffix}`;
};

const pickHeroMedia = (media) => {
  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }
  return media.find((item) => item.type === 'photo') || media[0];
};

const applyHeroMedia = (hero) => {
  const mediaTypeEl = document.getElementById('media-type');
  const mediaTimestampEl = document.getElementById('media-timestamp');
  const mediaContainer = document.querySelector('.media-photo');

  if (hero) {
    if (mediaTypeEl) {
      mediaTypeEl.textContent = hero.type?.toUpperCase?.() || 'MEDIA';
    }
    if (mediaTimestampEl) {
      const label = hero.capturedAt
        ? `${dateTimeFormatter.format(new Date(hero.capturedAt))}`
        : 'Captured date unknown';
      mediaTimestampEl.textContent = label;
    }
    if (mediaContainer && hero.path) {
      const url = hero.path.startsWith('http') ? hero.path : `${MEDIA_BASE_URL}${hero.path}`;
      mediaContainer.style.backgroundImage = `linear-gradient(135deg, rgba(255, 145, 0, 0.45), rgba(62, 166, 255, 0.35)), url('${url}')`;
    }
  } else {
    if (mediaTypeEl) mediaTypeEl.textContent = 'MEDIA';
    if (mediaTimestampEl) mediaTimestampEl.textContent = 'Capture time unavailable';
  }
};

const renderTags = (tags) => {
  const container = document.getElementById('tag-list');
  if (!container) return;
  container.innerHTML = '';
  if (!Array.isArray(tags) || tags.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'chip tag';
    empty.textContent = '#untagged';
    container.appendChild(empty);
    return;
  }
  tags.forEach((tag) => {
    const span = document.createElement('span');
    span.className = 'chip tag';
    span.dataset.slug = tag.slug;
    span.textContent = `#${tag.slug}`;
    container.appendChild(span);
  });
};

const renderComments = (comments) => {
  const container = document.getElementById('comments-list');
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(comments) || comments.length === 0) {
    const placeholder = document.createElement('p');
    placeholder.className = 'text-muted';
    placeholder.textContent = 'No comments yet. Be the first to share field conditions.';
    container.appendChild(placeholder);
    return;
  }

  comments.forEach((comment) => {
    const article = document.createElement('article');
    article.className = 'note';

    const header = document.createElement('header');
    header.className = 'note-meta';

    const authorSpan = document.createElement('span');
    authorSpan.className = 'note-author';
    authorSpan.textContent = comment?.author?.name || 'Anonymous';

    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'note-timestamp';
    const visited = comment.visitedAt ? `Visited ${dateTimeFormatter.format(new Date(comment.visitedAt))}` : null;
    const created = comment.createdAt ? dateTimeFormatter.format(new Date(comment.createdAt)) : null;
    timestampSpan.textContent = visited ? `${visited}` : created || '';

    header.appendChild(authorSpan);
    if (timestampSpan.textContent) {
      header.appendChild(timestampSpan);
    }

    const body = document.createElement('p');
    body.textContent = comment.body;

    article.appendChild(header);
    article.appendChild(body);
    container.appendChild(article);
  });
};

const metersToHuman = (value) => {
  if (!Number.isFinite(value)) {
    return '';
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} km away`;
  }
  return `${Math.round(value)} m away`;
};

const renderListItems = (items, container, { showDistance = false, extraMeta } = {}) => {
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(items) || items.length === 0) {
    const placeholder = document.createElement('li');
    placeholder.className = 'note';
    placeholder.textContent = 'No view points yet.';
    container.appendChild(placeholder);
    return;
  }

  items.forEach((item) => {
    const distanceText = showDistance && item.distanceM ? metersToHuman(item.distanceM) : '';
    const extraText = extraMeta ? extraMeta(item) : '';
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="thumb"></div>
      <div class="recommendation-copy">
        <a href="#" class="viewpoint-name">${item.title}</a>
        <span class="meta">${item.author?.name || ''}</span>
        ${distanceText ? `<span class="meta">${distanceText}</span>` : ''}
        ${extraText ? `<span class="meta">${extraText}</span>` : ''}
      </div>
      <button class="icon-button more" aria-label="More actions">...</button>
    `;
    container.appendChild(li);
  });
};

const applyViewpointDetail = (viewpoint) => {
  const titleEl = document.getElementById('viewpoint-title');
  if (titleEl) {
    titleEl.setAttribute('data-viewpoint-id', viewpoint.id);
    titleEl.textContent = viewpoint.title;
  }

  const descriptionEl = document.getElementById('viewpoint-description');
  if (descriptionEl) {
    descriptionEl.textContent = viewpoint.description || 'Description coming soon.';
  }

  const coordinateChip = document.getElementById('coordinate-chip');
  const latFormatted = formatCoordinate(viewpoint.coordinates?.latitude, 'N', 'S');
  const lngFormatted = formatCoordinate(viewpoint.coordinates?.longitude, 'E', 'W');
  if (coordinateChip) {
    coordinateChip.textContent = `${latFormatted} · ${lngFormatted}`;
  }

  const latEl = document.getElementById('detail-latitude');
  if (latEl) latEl.textContent = latFormatted;
  const lngEl = document.getElementById('detail-longitude');
  if (lngEl) lngEl.textContent = lngFormatted;
  const elevationEl = document.getElementById('detail-elevation');
  if (elevationEl) {
    elevationEl.textContent = viewpoint.elevationM ? `${Number(viewpoint.elevationM).toLocaleString()} m` : '—';
  }

  const submittedByEl = document.getElementById('submitted-by');
  if (submittedByEl) submittedByEl.textContent = viewpoint.author?.name || 'Unknown';
  const addedDateEl = document.getElementById('added-date');
  if (addedDateEl) addedDateEl.textContent = viewpoint.addedAt ? dateFormatter.format(new Date(viewpoint.addedAt)) : '—';
  const verifiedDateEl = document.getElementById('verified-date');
  if (verifiedDateEl) verifiedDateEl.textContent = viewpoint.verifiedAt ? dateFormatter.format(new Date(viewpoint.verifiedAt)) : '—';

  renderTags(viewpoint.tags);
  applyHeroMedia(pickHeroMedia(viewpoint.media));
  renderComments(viewpoint.comments);
};

const setFilterHeading = (title, subtext = '') => {
  const titleEl = document.getElementById('filter-title');
  if (titleEl) {
    titleEl.textContent = title;
  }
  const subtextEl = document.getElementById('filter-subtext');
  if (subtextEl) {
    subtextEl.textContent = subtext;
  }
};

const setActiveFilter = (filter) => {
  state.activeFilter = filter;
  document
    .querySelectorAll('[data-filter]')
    .forEach((chip) => chip.classList.toggle('active', chip.dataset.filter === filter));
};

const populateNearby = async ({ force = false, updateFilter = true } = {}) => {
  const detail = state.detail;
  if (!detail) return;

  if (!state.useSample && (!state.nearby || force)) {
    const params = new URLSearchParams({
      near_lat: detail.coordinates.latitude,
      near_lng: detail.coordinates.longitude,
      radius: '6000',
      limit: '5'
    });
    const nearbyResponse = await fetchJson(`/api/viewpoints?${params.toString()}`);
    state.nearby = nearbyResponse.data.filter((item) => item.id !== detail.id);
  }

  if (state.useSample && !state.nearby) {
    state.nearby = [];
  }

  if (updateFilter) {
    setFilterHeading('Nearby view points', 'Within 6 km radius');
    setActiveFilter('nearby');
    renderListItems(state.nearby, document.getElementById('filter-list'), {
      showDistance: true,
      extraMeta: (item) => (item.addedAt ? `Added ${dateFormatter.format(new Date(item.addedAt))}` : '')
    });
  }
};

const populateSharedTags = async ({ force = false, updatePanel = true, updateFilter = false } = {}) => {
  const detail = state.detail;
  const sharedList = document.getElementById('shared-tags-list');

  if (!detail?.tags?.length && !state.useSample) {
    if (updatePanel && sharedList) {
      renderListItems([], sharedList);
      const subtext = sharedList.previousElementSibling?.querySelector('.subtext');
      if (subtext) {
        subtext.textContent = 'No shared tags yet';
      }
    }
    if (updateFilter) {
      setFilterHeading('Shared tags', 'No tags available');
      setActiveFilter('shared');
      renderListItems([], document.getElementById('filter-list'));
    }
    return;
  }

  if (!state.useSample && (!state.shared || force)) {
    const primaryTag = detail.tags[0].slug;
    const related = await fetchJson(`/api/viewpoints?tag=${primaryTag}&limit=5`);
    state.shared = related.data.filter((item) => item.id !== detail.id);
    state.sharedSummary = detail.tags.map((tag) => `#${tag.slug}`).join(' · ');
  }

  if (state.useSample) {
    state.shared = state.shared ?? [];
    if (!state.sharedSummary && detail?.tags) {
      state.sharedSummary = detail.tags.map((tag) => `#${tag.slug}`).join(' · ');
    }
  }

  if (updatePanel && sharedList) {
    renderListItems(state.shared, sharedList, {
      extraMeta: (item) => item.tags?.map((tag) => `#${tag.slug}`).slice(0, 3).join(' ')
    });
    const subtext = sharedList.previousElementSibling?.querySelector('.subtext');
    if (subtext) {
      subtext.textContent = state.sharedSummary;
    }
  }

  if (updateFilter) {
    setFilterHeading('Shared tag matches', state.sharedSummary || 'Related tags');
    setActiveFilter('shared');
    renderListItems(state.shared, document.getElementById('filter-list'), {
      extraMeta: (item) => item.tags?.map((tag) => `#${tag.slug}`).slice(0, 3).join(' ')
    });
  }
};

const populateLatest = async ({ force = false, updateFilter = true } = {}) => {
  const detail = state.detail;
  if (!state.useSample && (!state.latest || force)) {
    const latestResponse = await fetchJson('/api/viewpoints?limit=5');
    state.latest = latestResponse.data.filter((item) => !detail || item.id !== detail.id);
  }

  if (state.useSample && !state.latest) {
    state.latest = [];
  }

  if (updateFilter) {
    setFilterHeading('Latest view points', 'Most recent submissions');
    setActiveFilter('latest');
    renderListItems(state.latest, document.getElementById('filter-list'), {
      extraMeta: (item) =>
        item.addedAt ? `Added ${dateFormatter.format(new Date(item.addedAt))}` : ''
    });
  }
};

const attachFilterHandlers = () => {
  if (state.handlersAttached) {
    return;
  }
  state.handlersAttached = true;
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', async () => {
      const filter = button.dataset.filter;
      if (filter === state.activeFilter) {
        return;
      }

      try {
        if (filter === 'nearby') {
          await populateNearby({ updateFilter: true });
        } else if (filter === 'shared') {
          await populateSharedTags({ updatePanel: false, updateFilter: true });
        } else if (filter === 'latest') {
          await populateLatest({ updateFilter: true });
        }
      } catch (error) {
        console.error('Failed to update filter list', error);
      }
    });
  });
};

const loadData = async () => {
  const addCommentButton = document.getElementById('add-comment');
  if (addCommentButton) {
    addCommentButton.addEventListener('click', () => {
      window.alert('Comment submission coming soon.');
    });
  }

  try {
    const detail = await fetchJson(`/api/viewpoints/${DEFAULT_VIEWPOINT_ID}`);
    state.useSample = false;
    state.detail = detail;
    applyViewpointDetail(detail);

    await populateNearby({ updateFilter: true, force: true });
    await populateSharedTags({ updatePanel: true, updateFilter: false, force: true });
    await populateLatest({ updateFilter: false, force: true });

    attachFilterHandlers();
  } catch (error) {
    console.error('Failed to load live data, falling back to sample dataset', error);
    await loadSampleData();
  }
};

const loadSampleData = async () => {
  try {
    const response = await fetch('sample-data.json');
    if (!response.ok) {
      throw new Error('Sample data unavailable');
    }
    const sample = await response.json();
    state.useSample = true;
    state.detail = sample.detail;
    state.nearby = sample.nearby ?? [];
    state.latest = sample.latest ?? [];
    state.shared = sample.shared ?? [];
    state.sharedSummary = sample.sharedSummary ?? (state.detail?.tags ? state.detail.tags.map((tag) => `#${tag.slug}`).join(' · ') : '');

    applyViewpointDetail(state.detail);
    setFilterHeading('Nearby view points', sample.nearbySubtext || 'Sample dataset');
    setActiveFilter('nearby');
    renderListItems(state.nearby, document.getElementById('filter-list'), {
      showDistance: true,
      extraMeta: (item) => (item.addedAt ? `Added ${dateFormatter.format(new Date(item.addedAt))}` : '')
    });

    await populateSharedTags({ updatePanel: true, updateFilter: false });
    await populateLatest({ updateFilter: false });

    attachFilterHandlers();
  } catch (sampleError) {
    console.error('Failed to load sample data', sampleError);
  }
};

const fetchJson = async (path) => {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};


if (typeof window !== 'undefined') {
  window.__VIEWPOINT_STATE__ = state;
  window.__loadSampleData = loadSampleData;
}

window.addEventListener('DOMContentLoaded', loadData);
