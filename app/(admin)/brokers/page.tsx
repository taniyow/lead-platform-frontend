import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { Broker } from '@/lib/api/types';
import { requireSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Brokers — Lead Distribution Platform',
};

export default async function BrokersPage() {
  await requireSession();
  const { brokers } = await backendFetch<{ brokers: Broker[] }>('/api/brokers');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Brokers</h1>
          <p className="text-sm text-muted-foreground">
            Brokers that can receive leads from the distribution.
          </p>
        </div>
        <Button asChild>
          <Link href="/brokers/new">New broker</Link>
        </Button>
      </div>

      {brokers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No brokers yet. Create your first broker to start distributing leads.
            </p>
            <Button asChild>
              <Link href="/brokers/new">New broker</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Daily cap</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Working days</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brokers.map((broker) => (
                  <TableRow key={broker.id}>
                    <TableCell className="font-medium">
                      <Link href={`/brokers/${broker.id}`} className="hover:underline">
                        {broker.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={broker.active ? 'default' : 'secondary'}>
                        {broker.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{broker.dailyCap}</TableCell>
                    <TableCell>{broker.timezone}</TableCell>
                    <TableCell>
                      {broker.openingTime}–{broker.closingTime}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {broker.workingDays.map((day) => day.slice(0, 3)).join(', ')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/brokers/${broker.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
