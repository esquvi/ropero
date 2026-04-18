-- Security fix: redeem_invite_code previously trusted a caller-supplied
-- redeemer_id parameter and wrote it into invite_redemptions.redeemed_by.
-- Because the function is SECURITY DEFINER, any authenticated user could
-- pass another user's UUID and pollute their redemption history.
--
-- Replace the signature so the caller cannot supply an identity. The function
-- now reads auth.uid() internally and rejects calls without a session.

DROP FUNCTION IF EXISTS public.redeem_invite_code(text, uuid);

CREATE OR REPLACE FUNCTION public.redeem_invite_code(invite_code text)
RETURNS json AS $$
DECLARE
  code_row public.invite_codes%ROWTYPE;
  caller_id uuid;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Lock the row for update to prevent race conditions on concurrent redemptions
  SELECT * INTO code_row
  FROM public.invite_codes
  WHERE code = invite_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid invite code');
  END IF;

  IF code_row.times_used >= code_row.max_uses THEN
    RETURN json_build_object('success', false, 'error', 'Invite code has reached maximum uses');
  END IF;

  -- Record the redemption using the caller's authenticated identity, not
  -- a user-supplied value
  INSERT INTO public.invite_redemptions (invite_code_id, redeemed_by)
  VALUES (code_row.id, caller_id);

  UPDATE public.invite_codes
  SET times_used = times_used + 1
  WHERE id = code_row.id;

  RETURN json_build_object('success', true, 'code_id', code_row.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
