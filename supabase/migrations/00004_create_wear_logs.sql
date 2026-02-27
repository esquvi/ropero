-- Wear Logs table
CREATE TABLE wear_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  outfit_id uuid REFERENCES outfits(id) ON DELETE SET NULL,
  worn_at date NOT NULL DEFAULT CURRENT_DATE,
  occasion text,
  weather_conditions text,
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX wear_logs_user_id_idx ON wear_logs(user_id);
CREATE INDEX wear_logs_item_id_idx ON wear_logs(item_id);
CREATE INDEX wear_logs_worn_at_idx ON wear_logs(user_id, worn_at DESC);

ALTER TABLE wear_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wear logs" ON wear_logs
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own wear logs" ON wear_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own wear logs" ON wear_logs
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own wear logs" ON wear_logs
  FOR DELETE USING (user_id = auth.uid());

-- Trigger to update item stats when a wear log is created
CREATE OR REPLACE FUNCTION update_item_wear_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE items
  SET times_worn = times_worn + 1,
      last_worn_at = NEW.worn_at
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER wear_log_update_item_stats
  AFTER INSERT ON wear_logs
  FOR EACH ROW EXECUTE FUNCTION update_item_wear_stats();
