'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApiClientError, apiFetch } from '@/lib/api/client';
import type { Broker, Distribution } from '@/lib/api/types';

interface RowState {
  included: boolean;
  percentage: number;
  active: boolean;
}

export function DistributionBrokersConfig({
  distribution,
  allBrokers,
}: {
  distribution: Distribution;
  allBrokers: Broker[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [rows, setRows] = useState<Record<number, RowState>>(() => {
    const initial: Record<number, RowState> = {};
    for (const broker of allBrokers) {
      const configured = distribution.brokers.find((b) => b.brokerId === broker.id);
      initial[broker.id] = configured
        ? { included: true, percentage: configured.percentage, active: configured.active }
        : { included: false, percentage: 0, active: true };
    }
    return initial;
  });

  const total = useMemo(
    () =>
      Object.values(rows)
        .filter((row) => row.included)
        .reduce((sum, row) => sum + (Number.isFinite(row.percentage) ? row.percentage : 0), 0),
    [rows],
  );

  function updateRow(brokerId: number, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [brokerId]: { ...prev[brokerId], ...patch } }));
  }

  async function handleSave() {
    const included = allBrokers
      .filter((broker) => rows[broker.id].included)
      .map((broker) => ({
        brokerId: broker.id,
        percentage: rows[broker.id].percentage,
        active: rows[broker.id].active,
      }));

    const invalid = included.find(
      (entry) =>
        !Number.isFinite(entry.percentage) || entry.percentage < 0 || entry.percentage > 100,
    );
    if (invalid) {
      toast.error('Each percentage must be a number between 0 and 100.');
      return;
    }

    setPending(true);
    try {
      await apiFetch(`/api/distributions/${distribution.id}/brokers`, {
        method: 'PATCH',
        body: JSON.stringify({ brokers: included }),
      });
      toast.success('Distribution brokers updated');
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  if (allBrokers.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No brokers exist yet. Create brokers first, then add them to the distribution.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Included</TableHead>
              <TableHead>Broker</TableHead>
              <TableHead className="w-36">Percentage</TableHead>
              <TableHead className="w-40">Status in distribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allBrokers.map((broker) => {
              const row = rows[broker.id];
              return (
                <TableRow key={broker.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={row.included}
                      onChange={(event) =>
                        updateRow(broker.id, { included: event.target.checked })
                      }
                      aria-label={`Include ${broker.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{broker.name}</span>
                      {!broker.active && <Badge variant="secondary">Globally inactive</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        className="w-24"
                        value={Number.isFinite(row.percentage) ? row.percentage : ''}
                        disabled={!row.included}
                        onChange={(event) =>
                          updateRow(broker.id, { percentage: event.target.valueAsNumber })
                        }
                        aria-label={`Percentage for ${broker.name}`}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.active ? 'active' : 'inactive'}
                      onValueChange={(value) => updateRow(broker.id, { active: value === 'active' })}
                      disabled={!row.included}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Total: {total}%</p>
          {total !== 100 && (
            <p className="text-sm text-amber-600 dark:text-amber-500">
              Current broker percentages total {total}%. Distribution will still use the
              configured weights.
            </p>
          )}
        </div>
        <Button onClick={handleSave} disabled={pending}>
          {pending ? 'Saving…' : 'Save configuration'}
        </Button>
      </div>
    </div>
  );
}
