import type { Metadata } from 'next';
import Link from 'next/link';
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
import { backendFetch } from '@/lib/api/server';
import type { DashboardStats } from '@/lib/api/types';
import { requireSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Dashboard — Lead Distribution Platform',
};

const STAT_CARDS = [
  { key: 'total', label: 'Total leads' },
  { key: 'sent', label: 'Sent' },
  { key: 'unsent', label: 'Unsent' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'failed', label: 'Failed' },
] as const;

export default async function DashboardPage() {
  await requireSession();
  const { stats } = await backendFetch<{ stats: DashboardStats }>('/api/dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {stats.form
            ? `Public form “${stats.form.name}” is live at /${stats.form.slug}.`
            : 'No lead form exists yet — create one to start receiving leads.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STAT_CARDS.map(({ key, label }) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-3xl">{stats.leadCounts[key]}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Broker utilization</CardTitle>
          <CardDescription>
            Sent counts are for each broker&apos;s own local day.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {stats.brokers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">No brokers yet.</p>
              <Button asChild size="sm">
                <Link href="/brokers/new">Create a broker</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broker</TableHead>
                  <TableHead>In distribution</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                  <TableHead className="text-right">Sent today / cap</TableHead>
                  <TableHead>Open now</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.brokers.map((broker) => (
                  <TableRow key={broker.id}>
                    <TableCell className="font-medium">
                      <Link href={`/brokers/${broker.id}`} className="hover:underline">
                        {broker.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {broker.inDistribution ? (
                        <Badge variant={broker.distributionActive ? 'default' : 'secondary'}>
                          {broker.distributionActive ? 'Active' : 'Inactive'}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {broker.percentage !== null ? `${broker.percentage}%` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          broker.sentToday >= broker.dailyCap
                            ? 'font-medium text-destructive'
                            : undefined
                        }
                      >
                        {broker.sentToday} / {broker.dailyCap}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={broker.openNow ? 'default' : 'secondary'}>
                        {broker.openNow ? 'Open' : 'Closed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={broker.active ? 'default' : 'secondary'}>
                        {broker.active ? 'Active' : 'Inactive'}
                      </Badge>
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
