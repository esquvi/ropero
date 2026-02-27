-- Seed data for local development
-- Run with: supabase db reset (applies migrations + seed)

-- Create a test user (only works in local Supabase)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test User"}',
  'authenticated',
  'authenticated'
);

-- Items: Tops
INSERT INTO items (id, user_id, name, brand, category, subcategory, color_primary, color_secondary, pattern, size, material, season, formality, status, tags) VALUES
('aaaaaaaa-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'White Oxford Shirt', 'Brooks Brothers', 'tops', 'dress shirt', 'white', NULL, 'solid', 'M', 'cotton', ARRAY['spring', 'summer', 'fall'], 4, 'active', ARRAY['classic', 'work']),
('aaaaaaaa-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'Navy Blue Polo', 'Ralph Lauren', 'tops', 'polo', 'navy', NULL, 'solid', 'M', 'cotton', ARRAY['spring', 'summer'], 3, 'active', ARRAY['casual', 'weekend']),
('aaaaaaaa-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'Gray Crewneck Sweater', 'Uniqlo', 'tops', 'sweater', 'gray', NULL, 'solid', 'M', 'merino wool', ARRAY['fall', 'winter'], 3, 'active', ARRAY['layering']),
('aaaaaaaa-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', 'Black T-Shirt', 'Everlane', 'tops', 't-shirt', 'black', NULL, 'solid', 'M', 'cotton', ARRAY['spring', 'summer', 'fall'], 2, 'active', ARRAY['basics', 'casual']),
('aaaaaaaa-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111', 'Striped Breton Shirt', 'Saint James', 'tops', 'long sleeve', 'white', 'navy', 'striped', 'M', 'cotton', ARRAY['spring', 'fall'], 2, 'active', ARRAY['french', 'casual']);

-- Items: Bottoms
INSERT INTO items (id, user_id, name, brand, category, subcategory, color_primary, pattern, size, material, season, formality, status, tags) VALUES
('aaaaaaaa-0002-0002-0002-000000000001', '11111111-1111-1111-1111-111111111111', 'Dark Wash Jeans', 'A.P.C.', 'bottoms', 'jeans', 'indigo', 'solid', '32', 'denim', ARRAY['spring', 'summer', 'fall', 'winter'], 2, 'active', ARRAY['staple', 'everyday']),
('aaaaaaaa-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'Khaki Chinos', 'Bonobos', 'bottoms', 'chinos', 'khaki', 'solid', '32', 'cotton', ARRAY['spring', 'summer', 'fall'], 3, 'active', ARRAY['work', 'smart casual']),
('aaaaaaaa-0002-0002-0002-000000000003', '11111111-1111-1111-1111-111111111111', 'Navy Dress Pants', 'Theory', 'bottoms', 'dress pants', 'navy', 'solid', '32', 'wool blend', ARRAY['spring', 'fall', 'winter'], 4, 'active', ARRAY['work', 'formal']),
('aaaaaaaa-0002-0002-0002-000000000004', '11111111-1111-1111-1111-111111111111', 'Olive Shorts', 'J.Crew', 'bottoms', 'shorts', 'olive', 'solid', '32', 'cotton', ARRAY['summer'], 2, 'active', ARRAY['casual', 'weekend']);

-- Items: Outerwear
INSERT INTO items (id, user_id, name, brand, category, subcategory, color_primary, pattern, size, material, season, formality, status, tags) VALUES
('aaaaaaaa-0003-0003-0003-000000000001', '11111111-1111-1111-1111-111111111111', 'Navy Blazer', 'Suitsupply', 'outerwear', 'blazer', 'navy', 'solid', '40R', 'wool', ARRAY['spring', 'fall', 'winter'], 4, 'active', ARRAY['versatile', 'smart casual']),
('aaaaaaaa-0003-0003-0003-000000000002', '11111111-1111-1111-1111-111111111111', 'Olive Field Jacket', 'Barbour', 'outerwear', 'jacket', 'olive', 'solid', 'M', 'waxed cotton', ARRAY['spring', 'fall'], 2, 'active', ARRAY['casual', 'outdoor']),
('aaaaaaaa-0003-0003-0003-000000000003', '11111111-1111-1111-1111-111111111111', 'Black Puffer Jacket', 'The North Face', 'outerwear', 'puffer', 'black', 'solid', 'M', 'nylon/down', ARRAY['winter'], 2, 'active', ARRAY['warm', 'casual']);

-- Items: Shoes
INSERT INTO items (id, user_id, name, brand, category, subcategory, color_primary, pattern, size, material, season, formality, status, tags) VALUES
('aaaaaaaa-0004-0004-0004-000000000001', '11111111-1111-1111-1111-111111111111', 'White Leather Sneakers', 'Common Projects', 'shoes', 'sneakers', 'white', 'solid', '42', 'leather', ARRAY['spring', 'summer', 'fall'], 2, 'active', ARRAY['minimal', 'versatile']),
('aaaaaaaa-0004-0004-0004-000000000002', '11111111-1111-1111-1111-111111111111', 'Brown Oxford Shoes', 'Allen Edmonds', 'shoes', 'oxford', 'brown', 'solid', '10', 'leather', ARRAY['spring', 'fall', 'winter'], 4, 'active', ARRAY['dress', 'work']),
('aaaaaaaa-0004-0004-0004-000000000003', '11111111-1111-1111-1111-111111111111', 'Navy Canvas Sneakers', 'Vans', 'shoes', 'sneakers', 'navy', 'solid', '10', 'canvas', ARRAY['spring', 'summer'], 1, 'active', ARRAY['casual', 'weekend']);

-- Items: Accessories
INSERT INTO items (id, user_id, name, brand, category, subcategory, color_primary, pattern, material, season, formality, status, tags) VALUES
('aaaaaaaa-0005-0005-0005-000000000001', '11111111-1111-1111-1111-111111111111', 'Brown Leather Belt', 'Anderson''s', 'accessories', 'belt', 'brown', 'solid', 'leather', ARRAY['spring', 'summer', 'fall', 'winter'], 3, 'active', ARRAY['staple']),
('aaaaaaaa-0005-0005-0005-000000000002', '11111111-1111-1111-1111-111111111111', 'Navy Wool Scarf', 'Johnstons of Elgin', 'accessories', 'scarf', 'navy', 'solid', 'cashmere', ARRAY['fall', 'winter'], 3, 'active', ARRAY['cold weather']),
('aaaaaaaa-0005-0005-0005-000000000003', '11111111-1111-1111-1111-111111111111', 'Tortoise Sunglasses', 'Ray-Ban', 'accessories', 'sunglasses', 'brown', 'solid', 'acetate', ARRAY['spring', 'summer'], 2, 'active', ARRAY['summer']);

-- Outfits
INSERT INTO outfits (id, user_id, name, occasion, rating, notes, tags) VALUES
('bbbbbbbb-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'Smart Casual Friday', 'work', 4, 'Great for casual Fridays at the office', ARRAY['work', 'smart casual']),
('bbbbbbbb-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'Weekend Brunch', 'casual', 5, 'Comfortable yet put-together for weekend outings', ARRAY['weekend', 'casual']);

-- Outfit Items
INSERT INTO outfit_items (outfit_id, item_id) VALUES
-- Smart Casual Friday: Oxford shirt + Khaki chinos + Navy blazer + Brown oxfords + Brown belt
('bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0001-0001-0001-000000000001'),
('bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0002-0002-0002-000000000002'),
('bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0003-0003-0003-000000000001'),
('bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0004-0004-0004-000000000002'),
('bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0005-0005-0005-000000000001'),
-- Weekend Brunch: Breton shirt + Dark jeans + White sneakers + Sunglasses
('bbbbbbbb-0001-0001-0001-000000000002', 'aaaaaaaa-0001-0001-0001-000000000005'),
('bbbbbbbb-0001-0001-0001-000000000002', 'aaaaaaaa-0002-0002-0002-000000000001'),
('bbbbbbbb-0001-0001-0001-000000000002', 'aaaaaaaa-0004-0004-0004-000000000001'),
('bbbbbbbb-0001-0001-0001-000000000002', 'aaaaaaaa-0005-0005-0005-000000000003');

-- Trip
INSERT INTO trips (id, user_id, name, destination, start_date, end_date, trip_type, notes, tags) VALUES
('cccccccc-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'Paris Weekend', 'Paris, France', '2026-04-15', '2026-04-18', 'leisure', 'Spring weekend getaway to Paris', ARRAY['europe', 'spring']);

-- Packing List
INSERT INTO packing_lists (id, trip_id, user_id, status, notes) VALUES
('dddddddd-0001-0001-0001-000000000001', 'cccccccc-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'draft', 'Pack light - walking expected');

-- Packing List Items
INSERT INTO packing_list_items (packing_list_id, item_id, packed) VALUES
('dddddddd-0001-0001-0001-000000000001', 'aaaaaaaa-0001-0001-0001-000000000005', false),
('dddddddd-0001-0001-0001-000000000001', 'aaaaaaaa-0001-0001-0001-000000000004', false),
('dddddddd-0001-0001-0001-000000000001', 'aaaaaaaa-0002-0002-0002-000000000001', false),
('dddddddd-0001-0001-0001-000000000001', 'aaaaaaaa-0002-0002-0002-000000000002', false),
('dddddddd-0001-0001-0001-000000000001', 'aaaaaaaa-0003-0003-0003-000000000002', false),
('dddddddd-0001-0001-0001-000000000001', 'aaaaaaaa-0004-0004-0004-000000000001', false);

-- Packing List Outfits
INSERT INTO packing_list_outfits (packing_list_id, outfit_id) VALUES
('dddddddd-0001-0001-0001-000000000001', 'bbbbbbbb-0001-0001-0001-000000000002');

-- Wear Logs (recent history)
INSERT INTO wear_logs (user_id, item_id, outfit_id, worn_at, occasion, notes) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0001-0001-0001-000000000001', 'bbbbbbbb-0001-0001-0001-000000000001', '2026-02-24', 'work', 'Team meeting day'),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0002-0002-0002-000000000002', 'bbbbbbbb-0001-0001-0001-000000000001', '2026-02-24', 'work', NULL),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0003-0003-0003-000000000001', 'bbbbbbbb-0001-0001-0001-000000000001', '2026-02-24', 'work', NULL),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0004-0004-0004-000000000002', 'bbbbbbbb-0001-0001-0001-000000000001', '2026-02-24', 'work', NULL),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0001-0001-0001-000000000005', 'bbbbbbbb-0001-0001-0001-000000000002', '2026-02-22', 'brunch', 'Sunny weekend'),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0002-0002-0002-000000000001', 'bbbbbbbb-0001-0001-0001-000000000002', '2026-02-22', 'brunch', NULL),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0004-0004-0004-000000000001', 'bbbbbbbb-0001-0001-0001-000000000002', '2026-02-22', 'brunch', NULL),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0001-0001-0001-000000000004', NULL, '2026-02-20', 'gym', 'Quick workout');
