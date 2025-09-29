const API_BASE_URL = window.API_BASE_URL || '';
const MEDIA_BASE_URL = window.MEDIA_BASE_URL || '';
const DEFAULT_VIEWPOINT_ID = 'f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42';

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
      const label = hero.capturedAt ? `${dateTimeFormatter.format(new Date(hero.capturedAt))}` : 'Captured date unknown';
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

const renderListItems = (items, container, { showDistance = false } = {}) => {
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
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="thumb"></div>
      <div class="recommendation-copy">
        <a href="#" class="viewpoint-name">${item.title}</a>
        <span class="meta">${item.author?.name || ''}</span>
        <span class="meta">${showDistance && item.distanceM ? metersToHuman(item.distanceM) : ''}</span>
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

const loadData = async () => {
  const addCommentButton = document.getElementById('add-comment');
  if (addCommentButton) {
    addCommentButton.addEventListener('click', () => {
      window.alert('Comment submission coming soon.');
    });
  }

  try {
    const detail = await fetchJson(`/api/viewpoints/${DEFAULT_VIEWPOINT_ID}`);
    applyViewpointDetail(detail);

    const nearbyParams = new URLSearchParams({
      near_lat: detail.coordinates.latitude,
      near_lng: detail.coordinates.longitude,
      radius: '6000',
      limit: '5'
    });
    const nearby = await fetchJson(`/api/viewpoints?${nearbyParams.toString()}`);
    const nearbyFiltered = nearby.data.filter((item) => item.id !== detail.id);
    renderListItems(nearbyFiltered, document.getElementById('nearby-list'), { showDistance: true });

    if (detail.tags?.length) {
      const primaryTag = detail.tags[0].slug;
      const related = await fetchJson(`/api/viewpoints?tag=${primaryTag}&limit=5`);
      const sharedFiltered = related.data.filter((item) => item.id !== detail.id);
      renderListItems(sharedFiltered, document.getElementById('shared-tags-list'));
      const sharedSubtext = document.querySelector('#shared-tags-list')?.previousElementSibling?.querySelector('.subtext');
      if (sharedSubtext) {
        sharedSubtext.textContent = detail.tags.map((tag) => `#${tag.slug}`).join(' · ');
      }
    }
  } catch (error) {
    console.error('Failed to load data', error);
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

window.addEventListener('DOMContentLoaded', loadData);
