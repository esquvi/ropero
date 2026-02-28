-- Allow users to insert their own invite code (for backfilling pre-existing users)
CREATE POLICY "Users can insert own invite code" ON invite_codes
  FOR INSERT WITH CHECK (user_id = auth.uid());
