// Shared wear-log grouping logic. Lifted from apps/web's dashboard recent-activity
// component so web and mobile can share one tested implementation. The `cap`
// parameter generalizes the previously hard-coded display limit (web used 10;
// mobile uses a different ratio) without changing default behavior.

export interface WearLogRow {
  id: string;
  worn_at: string;
  occasion: string | null;
  outfit_id: string | null;
  items: {
    name: string;
    category: string;
  };
  outfits: { name: string } | null;
}

// An activity entry is either a single item wear or a group of items worn
// together as an outfit on the same day.
export type ActivityEntry =
  | {
      kind: 'item';
      key: string;
      worn_at: string;
      occasion: string | null;
      item_name: string;
    }
  | {
      kind: 'outfit';
      key: string;
      worn_at: string;
      occasion: string | null;
      outfit_name: string;
      item_count: number;
    };

// Default display cap. Callers pull more rows than this so a multi-item outfit
// wear collapses into a single visible entry without pushing other activity off
// the end (mirrors mobile's 25/5 ratio).
export const MAX_ACTIVITY_ENTRIES = 10;

// Collapse wear_logs that share the same outfit_id + worn_at into a single
// outfit entry. Standalone item wears pass through untouched. Preserves the
// server-side order (worn_at desc, then created_at desc) and returns at most
// `cap` entries. Once the cap is hit no new entries are created, but counts on
// existing outfit groups continue to increment.
export function groupWearLogs(
  rows: WearLogRow[],
  cap: number = MAX_ACTIVITY_ENTRIES,
): ActivityEntry[] {
  const out: ActivityEntry[] = [];
  const outfitGroupByKey = new Map<string, Extract<ActivityEntry, { kind: 'outfit' }>>();

  for (const row of rows) {
    if (row.outfit_id) {
      const key = `${row.outfit_id}:${row.worn_at}`;
      const existing = outfitGroupByKey.get(key);
      if (existing) {
        existing.item_count += 1;
        continue;
      }
      if (out.length >= cap) continue;
      const entry: Extract<ActivityEntry, { kind: 'outfit' }> = {
        kind: 'outfit',
        key,
        worn_at: row.worn_at,
        occasion: row.occasion,
        outfit_name: row.outfits?.name ?? 'Outfit',
        item_count: 1,
      };
      outfitGroupByKey.set(key, entry);
      out.push(entry);
    } else {
      if (out.length >= cap) continue;
      out.push({
        kind: 'item',
        key: `item:${row.id}`,
        worn_at: row.worn_at,
        occasion: row.occasion,
        item_name: row.items.name,
      });
    }
  }

  return out;
}
