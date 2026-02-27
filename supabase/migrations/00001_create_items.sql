-- Items table: core wardrobe pieces
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text,
  category text NOT NULL,
  subcategory text,
  color_primary text NOT NULL,
  color_secondary text,
  pattern text,
  size text,
  material text,
  season text[] NOT NULL DEFAULT '{}',
  formality int NOT NULL DEFAULT 3 CHECK (formality BETWEEN 1 AND 5),
  photo_urls text[] NOT NULL DEFAULT '{}',
  purchase_date date,
  purchase_price numeric,
  purchase_source text,
  receipt_email_id text,
  times_worn int NOT NULL DEFAULT 0,
  last_worn_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'donated', 'sold')),
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX items_user_id_idx ON items(user_id);
CREATE INDEX items_category_idx ON items(user_id, category);
CREATE INDEX items_status_idx ON items(user_id, status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items" ON items
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own items" ON items
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own items" ON items
  FOR DELETE USING (user_id = auth.uid());
