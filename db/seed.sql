-- Seed data for ViewPoint Explorer
-- Run after schema.sql

BEGIN;

-- Clear existing data
TRUNCATE comment_reactions, comments, viewpoint_tags, media_assets, viewpoints, tags, authors RESTART IDENTITY CASCADE;

-- Authors
INSERT INTO authors (id, display_name, email, avatar_url)
VALUES
    ('b4a2b902-37ce-4290-a990-5eb0fdcfdc08', 'Alex Rivers', 'alex@example.com', NULL),
    ('95f5a6b1-4180-4e25-9bb5-fd1983a5e0b6', 'Priya Chen', 'priya@example.com', NULL),
    ('a1df7e1c-3c92-4cfa-9a9f-4c11f0758442', 'Jordan Malik', 'jordan@example.com', NULL);

-- Tags
INSERT INTO tags (id, slug, label)
VALUES
    ('6058c392-9635-4efd-9fba-62d6de1ca2fc', 'sunrise', 'Sunrise'),
    ('f5d4d1f9-1c51-4f02-8cdb-fef18284d888', 'mountain', 'Mountain'),
    ('75fb67d6-6953-4f4e-bc9f-6f9946466bc7', 'winter', 'Winter'),
    ('f6f34cdf-e2b9-45f6-9a40-1b0ed2fe2f49', 'photography', 'Photography'),
    ('bf33dc9b-698d-4ad5-b62a-bbe0ef0a6d2a', 'glacier', 'Glacier');

-- Viewpoints
INSERT INTO viewpoints (id, title, description, author_id, geom, captured_at, added_at, verified_at, elevation_m, status)
VALUES
    (
        'f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42',
        'Sunrise Ridge Lookout',
        'Sweeping perspective of the Cascade volcanic arc with sunrise alignment.',
        'b4a2b902-37ce-4290-a990-5eb0fdcfdc08',
        ST_SetSRID(ST_MakePoint(-121.7112, 45.3265), 4326),
        '2025-02-12T13:54:00Z',
        '2025-02-14T18:00:00Z',
        '2025-03-02T17:30:00Z',
        2685.00,
        'published'
    ),
    (
        '8a67059e-a931-4a98-8a7e-575149d6c12d',
        'Glacier Notch Overlook',
        'Viewpoint above the glacier with strong morning light, narrow ledge.',
        '95f5a6b1-4180-4e25-9bb5-fd1983a5e0b6',
        ST_SetSRID(ST_MakePoint(-121.6991, 45.3422), 4326),
        '2024-09-04T15:12:00Z',
        '2024-09-10T18:00:00Z',
        NULL,
        2865.00,
        'published'
    ),
    (
        '1a1cfaae-49aa-4be3-80ce-3de253442afa',
        'Timberline Shelf',
        'Accessible trail through forest canopy opening to southern valley views.',
        'a1df7e1c-3c92-4cfa-9a9f-4c11f0758442',
        ST_SetSRID(ST_MakePoint(-121.7355, 45.3019), 4326),
        '2024-11-20T19:30:00Z',
        '2024-12-01T18:00:00Z',
        '2025-01-05T18:00:00Z',
        1980.00,
        'published'
    ),
    (
        'd2a1fa0b-4a4c-4793-beda-5efb0b4f5c5f',
        'Ridgeback Aurora Point',
        'Northern-facing ridge with clear aurora views and foreground pines for framing.',
        '95f5a6b1-4180-4e25-9bb5-fd1983a5e0b6',
        ST_SetSRID(ST_MakePoint(-121.8124, 45.4121), 4326),
        '2025-01-18T06:42:00Z',
        '2025-01-21T18:00:00Z',
        '2025-02-05T18:00:00Z',
        2415.00,
        'published'
    ),
    (
        'c36f84f7-2c3f-4ed2-b050-119fde0b2858',
        'Riverbend Mist Overlook',
        'Ground fog settles along the valley river at dawn, revealing layered mountain silhouettes.',
        'a1df7e1c-3c92-4cfa-9a9f-4c11f0758442',
        ST_SetSRID(ST_MakePoint(-121.6652, 45.2987), 4326),
        '2024-10-11T14:30:00Z',
        '2024-10-15T18:00:00Z',
        NULL,
        1585.00,
        'published'
    ),
    (
        '2b6d2c61-51ce-4b2b-8074-1c6b65f0103b',
        'Icefall Sunrise Spur',
        'Craggy spur overlooking the glacier bowl with direct sunrise alignment.',
        '95f5a6b1-4180-4e25-9bb5-fd1983a5e0b6',
        ST_SetSRID(ST_MakePoint(-121.7200, 45.3330), 4326),
        '2025-01-05T14:10:00Z',
        '2025-01-08T18:00:00Z',
        '2025-02-01T18:00:00Z',
        2550.00,
        'published'
    ),
    (
        '8e0f0f4d-eab7-4c50-8be0-65c8cfa3b8b4',
        'Cinder Cone Overlook',
        'Low-lying cinder cone with panoramic views of the southern valley at dawn.',
        'b4a2b902-37ce-4290-a990-5eb0fdcfdc08',
        ST_SetSRID(ST_MakePoint(-121.7020, 45.3185), 4326),
        '2024-12-22T15:50:00Z',
        '2024-12-24T18:00:00Z',
        NULL,
        2055.00,
        'published'
    ),
    (
        'b7d12c8f-6ef2-4df4-98a1-dbd8740efd2e',
        'Fir Crest Watchtower',
        'Historic lookout nestled in fir crest with framed sunrise angles and sheltered deck.',
        'a1df7e1c-3c92-4cfa-9a9f-4c11f0758442',
        ST_SetSRID(ST_MakePoint(-121.7505, 45.3099), 4326),
        '2025-02-01T14:40:00Z',
        '2025-02-06T18:00:00Z',
        '2025-02-20T18:00:00Z',
        2108.00,
        'published'
    );

-- Media assets
INSERT INTO media_assets (id, viewpoint_id, media_type, storage_path, mime_type, width, height, duration_sec, captured_at, sort_order)
VALUES
    ('87cd3c75-f2dd-4e2e-9cb9-887371d05130', 'f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42', 'photo', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', 'image/jpeg', 4000, 2600, NULL, '2025-02-12T13:54:00Z', 0),
    ('f113ed9d-6aa3-4bc2-8c3f-3a77f4dc4b18', 'f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42', 'video', 'media/sunrise-ridge/trail-approach.mp4', 'video/mp4', 1920, 1080, 42.5, '2025-02-12T13:45:00Z', 1),
    ('1cf9de5d-3a9c-4a35-bde3-0f354f0433a0', '8a67059e-a931-4a98-8a7e-575149d6c12d', 'photo', 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=1600&q=80', 'image/jpeg', 5200, 2600, NULL, '2024-09-04T15:12:00Z', 0),
    ('b6f19bc5-1e6c-4996-9e9d-f36d8a4f6306', 'd2a1fa0b-4a4c-4793-beda-5efb0b4f5c5f', 'photo', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80', 'image/jpeg', 4800, 3200, NULL, '2025-01-18T06:42:00Z', 0),
    ('7c9c1a4b-27e0-43b4-9f77-724e70e4024e', 'd2a1fa0b-4a4c-4793-beda-5efb0b4f5c5f', 'video', 'media/ridgeback-aurora/timelapse.mp4', 'video/mp4', 1920, 1080, 68.0, '2025-01-18T06:40:00Z', 1),
    ('9e5649e7-e1d1-4955-8b68-76cdb6c22eef', 'c36f84f7-2c3f-4ed2-b050-119fde0b2858', 'photo', 'https://images.unsplash.com/photo-1441829266145-bf48adbb2282?auto=format&fit=crop&w=1600&q=80', 'image/jpeg', 4200, 2800, NULL, '2024-10-11T14:30:00Z', 0),
    ('51a4faaa-7c70-4e72-9a6d-07a8b3d8c062', '2b6d2c61-51ce-4b2b-8074-1c6b65f0103b', 'photo', 'https://images.unsplash.com/photo-1500043206221-4dc0b7d27960?auto=format&fit=crop&w=1600&q=80', 'image/jpeg', 4600, 3000, NULL, '2025-01-05T14:10:00Z', 0),
    ('f7a5d21d-1c6d-4b3c-868b-5f4f5ac64020', '8e0f0f4d-eab7-4c50-8be0-65c8cfa3b8b4', 'photo', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80', 'image/jpeg', 3800, 2500, NULL, '2024-12-22T15:50:00Z', 0),
    ('c34d57e4-8d02-45a1-9198-61c77f7dc12b', 'b7d12c8f-6ef2-4df4-98a1-dbd8740efd2e', 'photo', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', 'image/jpeg', 4000, 2600, NULL, '2025-02-01T14:40:00Z', 0);

-- Viewpoint tags
INSERT INTO viewpoint_tags (viewpoint_id, tag_id)
VALUES
    ('f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42', '6058c392-9635-4efd-9fba-62d6de1ca2fc'),
    ('f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42', 'f5d4d1f9-1c51-4f02-8cdb-fef18284d888'),
    ('f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42', '75fb67d6-6953-4f4e-bc9f-6f9946466bc7'),
    ('f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42', 'f6f34cdf-e2b9-45f6-9a40-1b0ed2fe2f49'),
    ('8a67059e-a931-4a98-8a7e-575149d6c12d', '6058c392-9635-4efd-9fba-62d6de1ca2fc'),
    ('8a67059e-a931-4a98-8a7e-575149d6c12d', 'bf33dc9b-698d-4ad5-b62a-bbe0ef0a6d2a'),
    ('1a1cfaae-49aa-4be3-80ce-3de253442afa', 'f5d4d1f9-1c51-4f02-8cdb-fef18284d888'),
    ('1a1cfaae-49aa-4be3-80ce-3de253442afa', 'f6f34cdf-e2b9-45f6-9a40-1b0ed2fe2f49'),
    ('d2a1fa0b-4a4c-4793-beda-5efb0b4f5c5f', 'f6f34cdf-e2b9-45f6-9a40-1b0ed2fe2f49'),
    ('d2a1fa0b-4a4c-4793-beda-5efb0b4f5c5f', '75fb67d6-6953-4f4e-bc9f-6f9946466bc7'),
    ('d2a1fa0b-4a4c-4793-beda-5efb0b4f5c5f', 'bf33dc9b-698d-4ad5-b62a-bbe0ef0a6d2a'),
    ('c36f84f7-2c3f-4ed2-b050-119fde0b2858', 'f6f34cdf-e2b9-45f6-9a40-1b0ed2fe2f49'),
    ('c36f84f7-2c3f-4ed2-b050-119fde0b2858', '6058c392-9635-4efd-9fba-62d6de1ca2fc'),
    ('2b6d2c61-51ce-4b2b-8074-1c6b65f0103b', '6058c392-9635-4efd-9fba-62d6de1ca2fc'),
    ('2b6d2c61-51ce-4b2b-8074-1c6b65f0103b', '75fb67d6-6953-4f4e-bc9f-6f9946466bc7'),
    ('2b6d2c61-51ce-4b2b-8074-1c6b65f0103b', 'bf33dc9b-698d-4ad5-b62a-bbe0ef0a6d2a'),
    ('8e0f0f4d-eab7-4c50-8be0-65c8cfa3b8b4', '6058c392-9635-4efd-9fba-62d6de1ca2fc'),
    ('8e0f0f4d-eab7-4c50-8be0-65c8cfa3b8b4', 'f5d4d1f9-1c51-4f02-8cdb-fef18284d888'),
    ('8e0f0f4d-eab7-4c50-8be0-65c8cfa3b8b4', 'f6f34cdf-e2b9-45f6-9a40-1b0ed2fe2f49'),
    ('b7d12c8f-6ef2-4df4-98a1-dbd8740efd2e', 'f5d4d1f9-1c51-4f02-8cdb-fef18284d888'),
    ('b7d12c8f-6ef2-4df4-98a1-dbd8740efd2e', '75fb67d6-6953-4f4e-bc9f-6f9946466bc7'),
    ('b7d12c8f-6ef2-4df4-98a1-dbd8740efd2e', 'f6f34cdf-e2b9-45f6-9a40-1b0ed2fe2f49');

-- Comments
INSERT INTO comments (id, viewpoint_id, author_id, body, visited_at, created_at, status)
VALUES
    (
        '38a998a4-3442-47b1-9c1a-476cccf45d90',
        'f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42',
        '95f5a6b1-4180-4e25-9bb5-fd1983a5e0b6',
        'Snowpack was compact and the eastern approach was clear. Tripod spikes were essential due to wind gusts along the ridge.',
        '2025-02-28T14:05:00Z',
        '2025-02-28T16:05:00Z',
        'published'
    ),
    (
        '768ef0c8-61b5-4c42-9c5b-7c3e79c06ec5',
        'f60c3f69-cd9b-4d17-84a8-d1c8c5c84a42',
        'a1df7e1c-3c92-4cfa-9a9f-4c11f0758442',
        'Arrived before sunrise; clouds cleared just in time. Great alternative framing if you hike 5 minutes north for higher elevation.',
        '2025-01-14T15:20:00Z',
        '2025-01-14T17:20:00Z',
        'published'
    ),
    (
        '9d8daf3d-e9d6-4721-84c8-dadf0a6e1fd4',
        '8a67059e-a931-4a98-8a7e-575149d6c12d',
        'b4a2b902-37ce-4290-a990-5eb0fdcfdc08',
        'Narrow ledge but tremendous glow when the sun breaks over the glacier. Bring microspikes.',
        '2024-09-06T15:18:00Z',
        '2024-09-06T18:18:00Z',
        'published'
    ),
    (
        'c282a6b1-3fb0-4619-bae5-02d17e09a2a7',
        'd2a1fa0b-4a4c-4793-beda-5efb0b4f5c5f',
        '95f5a6b1-4180-4e25-9bb5-fd1983a5e0b6',
        'Aurora activity was strong around 02:00; ridge blocks southern light pollution completely.',
        '2025-02-03T10:00:00Z',
        '2025-02-03T12:00:00Z',
        'published'
    ),
    (
        'a42fbd55-6f90-4c9a-93cf-846d76b5d6c0',
        'c36f84f7-2c3f-4ed2-b050-119fde0b2858',
        'b4a2b902-37ce-4290-a990-5eb0fdcfdc08',
        'Morning fog can be unpredictable—check river temperature first. Bring a neutral density filter.',
        '2024-10-20T14:40:00Z',
        '2024-10-20T16:40:00Z',
        'published'
    ),
    (
        'e8a0105c-5b70-44f9-bb31-0f959bb8f9da',
        '2b6d2c61-51ce-4b2b-8074-1c6b65f0103b',
        'a1df7e1c-3c92-4cfa-9a9f-4c11f0758442',
        'Wind cut sharply across the spur—microspikes and a wind shell recommended before sunrise.',
        '2025-01-30T13:55:00Z',
        '2025-01-30T16:00:00Z',
        'published'
    ),
    (
        '5ff7f353-a8f3-4d75-86cb-a86c807facf8',
        '8e0f0f4d-eab7-4c50-8be0-65c8cfa3b8b4',
        '95f5a6b1-4180-4e25-9bb5-fd1983a5e0b6',
        'Easy approach even in winter; light dusting of snow made for excellent contrast.',
        '2025-01-05T17:10:00Z',
        '2025-01-05T19:10:00Z',
        'published'
    ),
    (
        '6c1ac10b-0d75-4c1d-8705-345c3aaed640',
        'b7d12c8f-6ef2-4df4-98a1-dbd8740efd2e',
        'b4a2b902-37ce-4290-a990-5eb0fdcfdc08',
        'Watchtower deck fits three tripods; trees block wind gusts nicely.',
        '2025-02-15T14:20:00Z',
        '2025-02-15T16:30:00Z',
        'published'
    );

COMMIT;
