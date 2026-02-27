-- Outfits table
CREATE TABLE outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  occasion text,
  photo_url text,
  rating int CHECK (rating BETWEEN 1 AND 5),
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX outfits_user_id_idx ON outfits(user_id);

CREATE TRIGGER outfits_updated_at
  BEFORE UPDATE ON outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outfits" ON outfits
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own outfits" ON outfits
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own outfits" ON outfits
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own outfits" ON outfits
  FOR DELETE USING (user_id = auth.uid());

-- Outfit-Items join table
CREATE TABLE outfit_items (
  outfit_id uuid NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  PRIMARY KEY (outfit_id, item_id)
);

ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

-- RLS via outfit ownership
CREATE POLICY "Users can view own outfit items" ON outfit_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_id AND outfits.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own outfit items" ON outfit_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_id AND outfits.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own outfit items" ON outfit_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_id AND outfits.user_id = auth.uid())
  );
