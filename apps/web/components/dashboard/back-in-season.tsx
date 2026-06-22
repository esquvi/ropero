import Link from 'next/link';
import { lastWornSince } from '@ropero/core';

export interface BackInSeasonPiece {
  id: string;
  name: string;
  last_worn_at: string | null;
}

interface BackInSeasonProps {
  pieces: BackInSeasonPiece[];
}

// The dashboard "back in season" module: pieces whose season has come back
// around and that haven't been reached for this season. Stated as fact, links
// to the piece detail, never an instruction to wear. Quietly omits itself when
// there is nothing to resurface (new account, everything worn this season).
export function BackInSeason({ pieces }: BackInSeasonProps) {
  if (pieces.length === 0) return null;
  const now = new Date();

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-1 text-sm font-semibold">Back in season</h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Pieces you haven&rsquo;t reached for this season.
      </p>
      <div className="space-y-2">
        {pieces.map((piece) => {
          const since = lastWornSince(piece.last_worn_at, now);
          return (
            <Link
              key={piece.id}
              href={`/wardrobe/${piece.id}`}
              className="flex items-center justify-between gap-3 rounded p-2 transition-colors hover:bg-muted/50"
            >
              <span className="truncate text-sm">{piece.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {since === null ? (
                  <span className="tabular-nums text-gold/55">not worn yet</span>
                ) : (
                  <>
                    not worn since <span className="tabular-nums text-gold">{since}</span>
                  </>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
