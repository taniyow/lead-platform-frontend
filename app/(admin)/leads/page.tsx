import type { Metadata } from 'next';
import { ManualAssignDialog } from '@/components/leads/manual-assign-dialog';
import { StatusBadge } from '@/components/leads/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { backendFetch } from '@/lib/api/server';
import type { AdminLead, DashboardStats } from '@/lib/api/types';
import { requireSession } from '@/lib/auth/session';
import { formatDateTime } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Leads — Lead Distribution Platform',
};

export default async function LeadsPage() {
  await requireSession();
  const [{ leads }, { stats }] = await Promise.all([
    backendFetch<{ leads: AdminLead[] }>('/api/leads'),
    backendFetch<{ stats: DashboardStats }>('/api/dashboard'),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="text-sm text-muted-foreground">
          All submitted leads. Unsent leads can be manually assigned to a broker.
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto">
          {leads.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No leads submitted yet. Share the public form URL to start receiving leads.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>IP address</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.normalizedEmail}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell className="font-mono text-xs">{lead.ipAddress}</TableCell>
                    <TableCell>{lead.formName}</TableCell>
                    <TableCell>{lead.brokerName ?? '—'}</TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(lead.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {lead.status === 'unsent' && (
                        <ManualAssignDialog
                          leadId={lead.id}
                          leadName={lead.name}
                          brokers={stats.brokers}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
