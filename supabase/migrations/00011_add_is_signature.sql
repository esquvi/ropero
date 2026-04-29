-- Per-piece manual flag for the "Signature" gesture on the wardrobe grid.
-- Replaces the (never-shipped) "favorite" concept with editorial-fashion
-- vocabulary. Used in the sort menu (Signature first), as a toggle on the
-- item card, and persisted across active/archive transitions. Source:
-- docs/plans/2026-04-29-wardrobe-shape.md.

ALTER TABLE items
  ADD COLUMN is_signature boolean NOT NULL DEFAULT false;

-- Partial index — only the small subset of pieces a user has actually
-- marked. Supports "Signature first" sort and detail-page lookups
-- without bloating the full-table index.
CREATE INDEX items_is_signature_idx
  ON items(user_id)
  WHERE is_signature = true;
