-- Collapse legacy occasion values 'sport' and 'workout' into 'exercise'.
-- The UI previously exposed two near-synonyms (`sport` in packages/core, `workout`
-- in the web-only fork of OCCASIONS); both are merged into a single `exercise`
-- bucket as part of consolidating OCCASIONS in @ropero/core.
update public.outfits
set occasion = 'exercise'
where occasion in ('sport', 'workout');

update public.wear_logs
set occasion = 'exercise'
where occasion in ('sport', 'workout');
