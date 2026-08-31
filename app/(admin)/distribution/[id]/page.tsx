import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/leads/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { Distribution, DistributionLead } from '@/lib/api/types';
import { requireSession } from '@/lib/auth/session';
import { formatDateTime } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Distribution detail — Lead Distribution Platform',
};

export default async function DistributionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  let distribution: Distribution;
  let leads: DistributionLead[];
  try {
    [{ distribution }, { leads }] = await Promise.all([
      backendFetch<{ distribution: Distribution }>(`/api/distributions/${id}`),
      backendFetch<{ leads: DistributionLead[] }>(`/api/distributions/${id}/leads`),
    ]);
  } catch (err) {
    if (err instanceof BackendError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Distribution #{distribution.id}</h1>
          <p className="text-sm text-muted-foreground">
            Form “{distribution.formName}” · Created {formatDateTime(distribution.createdAt)}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/distribution">Configure brokers</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participating brokers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {distribution.brokers.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No brokers configured yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broker</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                  <TableHead>In distribution</TableHead>
                  <TableHead>Global status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distribution.brokers.map((broker) => (
                  <TableRow key={broker.brokerId}>
                    <TableCell className="font-medium">
                      <Link href={`/brokers/${broker.brokerId}`} className="hover:underline">
                        {broker.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{broker.percentage}%</TableCell>
                    <TableCell>
                      <Badge variant={broker.active ? 'default' : 'secondary'}>
                        {broker.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={broker.brokerActive ? 'default' : 'secondary'}>
                        {broker.brokerActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <p className="pt-3 text-sm text-muted-foreground">
            Total configured: {distribution.totalPercentage}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead history</CardTitle>
          <CardDescription>
            Every lead that passed through this distribution — sent, unsent, duplicate, and
            failed.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {leads.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No leads have passed through this distribution yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>IP address</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.normalizedEmail}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell className="font-mono text-xs">{lead.ipAddress}</TableCell>
                    <TableCell>{lead.brokerName ?? '—'}</TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(lead.createdAt)}</TableCell>
                    <TableCell>{formatDateTime(lead.assignedAt)}</TableCell>
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
