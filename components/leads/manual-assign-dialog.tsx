'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiClientError, apiFetch } from '@/lib/api/client';
import type { DashboardBrokerStat } from '@/lib/api/types';

export function ManualAssignDialog({
  leadId,
  leadName,
  brokers,
}: {
  leadId: number;
  leadName: string;
  brokers: DashboardBrokerStat[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [brokerId, setBrokerId] = useState<string>('');

  const eligibleList = useMemo(() => brokers.filter((b) => b.inDistribution), [brokers]);
  const selected = eligibleList.find((b) => String(b.id) === brokerId);

  const warnings: string[] = [];
  if (selected) {
    if (!selected.openNow) {
      warnings.push('This broker is currently outside its working hours.');
    }
    if (selected.sentToday >= selected.dailyCap) {
      warnings.push('This broker has already reached its daily cap.');
    }
    if (!selected.active) {
      warnings.push('This broker is globally inactive.');
    }
    if (!selected.distributionActive) {
      warnings.push('This broker is inactive inside the distribution.');
    }
  }

  async function handleAssign() {
    if (!selected) {
      return;
    }
    setPending(true);
    try {
      await apiFetch(`/api/leads/${leadId}/manual-assign`, {
        method: 'POST',
        body: JSON.stringify({ brokerId: selected.id }),
      });
      toast.success(`Lead assigned to ${selected.name}`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manually assign lead</DialogTitle>
          <DialogDescription>
            Assign “{leadName}” to a broker in the distribution. Manual assignment overrides
            working hours and daily caps.
          </DialogDescription>
        </DialogHeader>

        {eligibleList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No brokers are configured in the distribution yet.
          </p>
        ) : (
          <div className="space-y-3">
            <Select value={brokerId} onValueChange={setBrokerId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a broker" />
              </SelectTrigger>
              <SelectContent>
                {eligibleList.map((broker) => (
                  <SelectItem key={broker.id} value={String(broker.id)}>
                    {broker.name} ({broker.sentToday}/{broker.dailyCap} today)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {warnings.length > 0 && (
              <div className="space-y-1 rounded-md border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/40">
                {warnings.map((warning) => (
                  <p key={warning} className="text-sm text-amber-700 dark:text-amber-400">
                    {warning}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={pending || !selected}>
            {pending ? 'Assigning…' : 'Assign lead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
