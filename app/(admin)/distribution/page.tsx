import type { Metadata } from 'next';
import Link from 'next/link';
import { CreateDistributionButton } from '@/components/distributions/create-distribution-button';
import { DistributionBrokersConfig } from '@/components/distributions/distribution-brokers-config';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { backendFetch } from '@/lib/api/server';
import type { Broker, Distribution } from '@/lib/api/types';
import { requireSession } from '@/lib/auth/session';
import { formatDateTime } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Distribution — Lead Distribution Platform',
};

export default async function DistributionPage() {
  await requireSession();
  const [{ distribution }, { brokers }] = await Promise.all([
    backendFetch<{ distribution: Distribution | null }>('/api/distributions'),
    backendFetch<{ brokers: Broker[] }>('/api/brokers'),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Distribution</h1>
          <p className="text-sm text-muted-foreground">
            Only one distribution can exist. It is automatically attached to the lead form.
          </p>
        </div>
        {distribution && (
          <Button asChild variant="outline">
            <Link href={`/distribution/${distribution.id}`}>View lead history</Link>
          </Button>
        )}
      </div>

      {distribution ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Distribution #{distribution.id}</CardTitle>
              <CardDescription>
                Attached to form “{distribution.formName}” (
                <span className="font-mono">/{distribution.formSlug}</span>) · Created{' '}
                {formatDateTime(distribution.createdAt)}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participating brokers</CardTitle>
              <CardDescription>
                Percentage sets each broker&apos;s target share. Leads go to the eligible broker
                with the highest deficit against that target.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DistributionBrokersConfig distribution={distribution} allBrokers={brokers} />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create the distribution</CardTitle>
            <CardDescription>
              The distribution routes submitted leads to participating brokers. A lead form must
              exist before a distribution can be created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateDistributionButton />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
