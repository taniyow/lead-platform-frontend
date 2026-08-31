import { Badge } from '@/components/ui/badge';
import type { LeadStatus } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<LeadStatus, string> = {
  sent: 'border-transparent bg-emerald-600 text-white dark:bg-emerald-500',
  unsent: 'border-transparent bg-muted text-muted-foreground',
  duplicate: 'border-transparent bg-amber-500 text-white',
  failed: 'border-transparent bg-destructive text-white',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={cn('capitalize', STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}
