const parseJsonColumn = (value, fallback = []) => {
  if (value == null) {
    return fallback;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      console.error('Unable to parse JSON column', err);
      return fallback;
    }
  }
  return value;
};

export const mapViewpointRow = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  coordinates: {
    latitude: Number(row.latitude),
    longitude: Number(row.longitude)
  },
  capturedAt: row.captured_at,
  addedAt: row.added_at,
  verifiedAt: row.verified_at,
  elevationM: row.elevation_m != null ? Number(row.elevation_m) : null,
  distanceM: row.distance_m != null ? Number(row.distance_m) : null,
  status: row.status,
  author: {
    id: row.author_id,
    name: row.author_name
  },
  media: parseJsonColumn(row.media),
  tags: parseJsonColumn(row.tags)
});

export const mapViewpointDetailRow = (row) => ({
  ...mapViewpointRow(row),
  description: row.description,
  addedAt: row.added_at,
  verifiedAt: row.verified_at,
  elevationM: row.elevation_m != null ? Number(row.elevation_m) : null,
  comments: parseJsonColumn(row.comments)
});

export const mapCommentRow = (row) => ({
  id: row.id,
  body: row.body,
  visitedAt: row.visited_at,
  createdAt: row.created_at,
  status: row.status,
  author: row.author_id
    ? {
        id: row.author_id,
        name: row.author_name
      }
    : null
});
