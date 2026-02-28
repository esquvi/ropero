'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Redemption {
  id: string;
  created_at: string;
  redeemed_by_email: string | null;
  redeemed_by_name: string | null;
}

interface InviteSectionProps {
  code: string;
  maxUses: number;
  timesUsed: number;
  redemptions: Redemption[];
}

export function InviteSection({ code, maxUses, timesUsed, redemptions }: InviteSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const remaining = maxUses - timesUsed;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <code className="rounded-md bg-muted px-3 py-2 text-lg font-mono font-semibold tracking-widest">
          {code}
        </code>
        <Button variant="outline" size="icon" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {timesUsed} of {maxUses} invites used &middot; {remaining} remaining
      </p>

      {redemptions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Invited friends</p>
          <div className="space-y-1">
            {redemptions.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{r.redeemed_by_name || r.redeemed_by_email || 'Unknown'}</span>
                <span className="text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
