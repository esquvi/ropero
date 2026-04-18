-- Security fix: the "Anyone can validate invite codes" policy on invite_codes
-- was defined as USING (true), which let any authenticated user read every
-- invite code in the table. Combined with the owner-scoped policy, the
-- permissive one wins (policies are OR'd), so enumeration was trivial.
--
-- Swap the direct-table validation path for a targeted RPC that returns only
-- the yes/no/remaining fields signup actually needs, then drop the permissive
-- policy. After this migration:
--   - anon cannot SELECT invite_codes directly (no policy matches anon role).
--   - authenticated can SELECT only their own codes plus the founder seed
--     row (user_id IS NULL), via the pre-existing owner policy.
--   - signup and any other code that needs to check a code validity goes
--     through validate_invite_code(code text), which is SECURITY DEFINER and
--     deliberately exposes only aggregate status, no ids, no owner.

DROP POLICY IF EXISTS "Anyone can validate invite codes" ON public.invite_codes;

CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_row public.invite_codes%ROWTYPE;
BEGIN
  IF p_code IS NULL OR length(p_code) = 0 THEN
    RETURN json_build_object('valid', false, 'reason', 'not_found');
  END IF;

  SELECT * INTO code_row
  FROM public.invite_codes
  WHERE code = p_code;

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'reason', 'not_found');
  END IF;

  IF code_row.times_used >= code_row.max_uses THEN
    RETURN json_build_object('valid', false, 'reason', 'exhausted');
  END IF;

  RETURN json_build_object(
    'valid', true,
    'times_used', code_row.times_used,
    'max_uses', code_row.max_uses
  );
END;
$$;

-- Signup (anon) and any authed form that wants to pre-validate must call this
-- RPC instead of hitting the table.
GRANT EXECUTE ON FUNCTION public.validate_invite_code(text) TO anon, authenticated;
