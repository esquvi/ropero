-- Invite Codes table
CREATE TABLE invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  max_uses int NOT NULL DEFAULT 5,
  times_used int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invite_codes_user_id_idx ON invite_codes(user_id);
CREATE INDEX invite_codes_code_idx ON invite_codes(code);

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invite codes" ON invite_codes
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Anyone can validate invite codes" ON invite_codes
  FOR SELECT USING (true);

-- Invite Redemptions table
CREATE TABLE invite_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code_id uuid NOT NULL REFERENCES invite_codes(id) ON DELETE CASCADE,
  redeemed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invite_redemptions_invite_code_id_idx ON invite_redemptions(invite_code_id);

ALTER TABLE invite_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view redemptions of own codes" ON invite_redemptions
  FOR SELECT USING (
    invite_code_id IN (SELECT id FROM invite_codes WHERE user_id = auth.uid())
  );

-- Generate a random 8-char alphanumeric invite code (no ambiguous chars: 0/O/1/I)
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Redeem an invite code: validates, locks row, increments usage, records redemption
CREATE OR REPLACE FUNCTION redeem_invite_code(invite_code text, redeemer_id uuid)
RETURNS json AS $$
DECLARE
  code_row invite_codes%ROWTYPE;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT * INTO code_row
  FROM invite_codes
  WHERE code = invite_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid invite code');
  END IF;

  IF code_row.times_used >= code_row.max_uses THEN
    RETURN json_build_object('success', false, 'error', 'Invite code has reached maximum uses');
  END IF;

  -- Record the redemption
  INSERT INTO invite_redemptions (invite_code_id, redeemed_by)
  VALUES (code_row.id, redeemer_id);

  -- Increment usage counter
  UPDATE invite_codes
  SET times_used = times_used + 1
  WHERE id = code_row.id;

  RETURN json_build_object('success', true, 'code_id', code_row.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: automatically create an invite code for new users
CREATE OR REPLACE FUNCTION create_invite_code_for_user()
RETURNS TRIGGER AS $$
DECLARE
  new_code text;
  attempts int := 0;
BEGIN
  LOOP
    attempts := attempts + 1;
    new_code := public.generate_invite_code();

    BEGIN
      INSERT INTO public.invite_codes (user_id, code)
      VALUES (NEW.id, new_code);
      EXIT; -- success, break out of loop
    EXCEPTION WHEN unique_violation THEN
      IF attempts >= 10 THEN
        RAISE EXCEPTION 'Could not generate unique invite code after 10 attempts';
      END IF;
      -- retry with a new code
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_invite_code_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_invite_code_for_user();

-- Seed: founder invite code with unlimited uses
INSERT INTO invite_codes (code, max_uses, user_id)
VALUES ('ROPERO01', 9999, NULL);
