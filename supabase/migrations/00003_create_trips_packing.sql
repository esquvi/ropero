-- Trips table
CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  destination text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  trip_type text NOT NULL,
  weather_forecast jsonb,
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX trips_user_id_idx ON trips(user_id);

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own trips" ON trips
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE USING (user_id = auth.uid());

-- Packing Lists table
CREATE TABLE packing_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'packed')),
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX packing_lists_trip_id_idx ON packing_lists(trip_id);

CREATE TRIGGER packing_lists_updated_at
  BEFORE UPDATE ON packing_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own packing lists" ON packing_lists
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own packing lists" ON packing_lists
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own packing lists" ON packing_lists
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own packing lists" ON packing_lists
  FOR DELETE USING (user_id = auth.uid());

-- Packing List Items join table
CREATE TABLE packing_list_items (
  packing_list_id uuid NOT NULL REFERENCES packing_lists(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  packed boolean NOT NULL DEFAULT false,
  PRIMARY KEY (packing_list_id, item_id)
);

ALTER TABLE packing_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own packing list items" ON packing_list_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own packing list items" ON packing_list_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
CREATE POLICY "Users can update own packing list items" ON packing_list_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own packing list items" ON packing_list_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );

-- Packing List Outfits join table
CREATE TABLE packing_list_outfits (
  packing_list_id uuid NOT NULL REFERENCES packing_lists(id) ON DELETE CASCADE,
  outfit_id uuid NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  PRIMARY KEY (packing_list_id, outfit_id)
);

ALTER TABLE packing_list_outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own packing list outfits" ON packing_list_outfits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own packing list outfits" ON packing_list_outfits
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own packing list outfits" ON packing_list_outfits
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
