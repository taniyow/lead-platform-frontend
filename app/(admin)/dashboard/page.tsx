import type { Metadata } from 'next';
import { requireSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Dashboard — Lead Distribution Platform',
};

export default async function DashboardPage() {
  await requireSession();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        Overview metrics will appear here once the distribution pipeline is built.
      </p>
    </div>
  );
}
