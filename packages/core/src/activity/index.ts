// Activity feed helpers shared between web and mobile dashboards.
//
// Both surfaces query `wear_logs` joined with `items(name)` and `outfits(name)`
// and need to (a) collapse multi-row outfit wears into a single entry and
// (b) render the `worn_at` date as a relative phrase ("Today", "3 days ago").
// Lifting the logic here ensures the two surfaces stay in lockstep and gives
// us a single place to fix the timezone off-by-one that bare `YYYY-MM-DD`
// strings caused on negative-UTC offsets.

export interface WearLogRow {
  id: string;
  worn_at: string;
  occasion: string | null;
  outfit_id: string | null;
  items: { name: string } | null;
  outfits: { name: string } | null;
}

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

export interface GroupWearLogsOptions {
  // Maximum number of entries to return. Mobile uses 5, web uses 10.
  maxEntries: number;
}

// Collapse wear_logs that share the same outfit_id + worn_at into a single
// outfit entry. Standalone item wears pass through untouched. Preserves the
// caller's row order (typically worn_at desc, then created_at desc) and
// returns at most `maxEntries` entries. Once the cap is hit no new entries
// are created, but counts on existing outfit groups continue to increment so
// a multi-row outfit wear is fully represented even when partially past the
// cap.
export function groupWearLogs(
  rows: WearLogRow[],
  options: GroupWearLogsOptions,
): ActivityEntry[] {
  const out: ActivityEntry[] = [];
  const outfitGroupByKey = new Map<
    string,
    Extract<ActivityEntry, { kind: 'outfit' }>
  >();

  for (const row of rows) {
    if (row.outfit_id) {
      const key = `${row.outfit_id}:${row.worn_at}`;
      const existing = outfitGroupByKey.get(key);
      if (existing) {
        existing.item_count += 1;
        continue;
      }
      if (out.length >= options.maxEntries) continue;
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
      if (out.length >= options.maxEntries) continue;
      out.push({
        kind: 'item',
        key: `item:${row.id}`,
        worn_at: row.worn_at,
        occasion: row.occasion,
        item_name: row.items?.name ?? 'Item',
      });
    }
  }

  return out;
}

// `new Date('YYYY-MM-DD')` parses as UTC midnight, which renders as the
// previous calendar day for negative-UTC offsets. Anchor bare date-only
// strings at local midnight so day arithmetic against `now` is stable.
// Strings with explicit time/zone information are passed through as-is.
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function parseWearDate(dateStr: string): Date {
  if (DATE_ONLY.test(dateStr)) return new Date(`${dateStr}T00:00:00`);
  return new Date(dateStr);
}

export interface FormatRelativeWearDateOptions {
  // 'long' yields "3 days ago" (web). 'short' yields "3d ago" (mobile).
  style?: 'long' | 'short';
  // Override "now" for tests; defaults to the current time.
  now?: Date;
}

// Render a `worn_at` date as a relative phrase using calendar-day math
// anchored to the local timezone. Today/Yesterday for the two most recent
// days, "Nd ago" / "N days ago" for the rest of the past week, and a
// localized month-day fallback otherwise.
export function formatRelativeWearDate(
  dateStr: string,
  options: FormatRelativeWearDateOptions = {},
): string {
  const { style = 'long', now = new Date() } = options;
  const date = parseWearDate(dateStr);

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) {
    return style === 'short' ? `${diffDays}d ago` : `${diffDays} days ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
