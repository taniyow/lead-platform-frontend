import type { Metadata } from 'next';
import { BrokerForm } from '@/components/brokers/broker-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'New broker — Lead Distribution Platform',
};

export default async function NewBrokerPage() {
  await requireSession();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New broker</h1>
      <Card>
        <CardHeader>
          <CardTitle>Broker details</CardTitle>
          <CardDescription>
            Availability is evaluated in the broker&apos;s own timezone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrokerForm />
        </CardContent>
      </Card>
    </div>
  );
}
