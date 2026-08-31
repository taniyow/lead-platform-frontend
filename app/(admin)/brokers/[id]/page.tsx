import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrokerForm } from '@/components/brokers/broker-form';
import { StatusBadge } from '@/components/leads/status-badge';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BackendError, backendFetch } from '@/lib/api/server';
import type { Broker, BrokerLead } from '@/lib/api/types';
import { requireSession } from '@/lib/auth/session';
import { formatDateTime } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Broker — Lead Distribution Platform',
};

export default async function BrokerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;

  let broker: Broker;
  let leads: BrokerLead[];
  try {
    [{ broker }, { leads }] = await Promise.all([
      backendFetch<{ broker: Broker }>(`/api/brokers/${id}`),
      backendFetch<{ leads: BrokerLead[] }>(`/api/brokers/${id}/leads`),
    ]);
  } catch (err) {
    if (err instanceof BackendError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{broker.name}</h1>
        <Badge variant={broker.active ? 'default' : 'secondary'}>
          {broker.active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Schedule and cap changes affect eligibility immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrokerForm broker={broker} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Received leads</CardTitle>
          <CardDescription>All leads assigned to this broker.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {leads.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No leads received yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>IP address</TableHead>
                  <TableHead>Form name</TableHead>
                  <TableHead>Date received</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>{formatDateTime(lead.receivedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
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
