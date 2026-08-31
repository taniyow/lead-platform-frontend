'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ApiClientError, apiFetch } from '@/lib/api/client';

export function CreateDistributionButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setPending(true);
    setError(null);
    try {
      await apiFetch('/api/distributions', { method: 'POST' });
      toast.success('Distribution created');
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleCreate} disabled={pending}>
        {pending ? 'Creating…' : 'Create distribution'}
      </Button>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
