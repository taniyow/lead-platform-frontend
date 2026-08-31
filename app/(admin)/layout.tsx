import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { requireSession } from '@/lib/auth/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userEmail={user.email} />
      <main className="flex-1 overflow-x-hidden p-6 lg:p-8">{children}</main>
    </div>
  );
}
