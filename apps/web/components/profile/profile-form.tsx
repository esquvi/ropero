'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileFormProps {
  name: string;
  email: string;
}

export function ProfileForm({ name: initialName, email }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { name } });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <div className="flex gap-2">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={handleSave} disabled={saving || name === initialName}>
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
    </div>
  );
}
