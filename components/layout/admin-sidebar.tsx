'use client';

import { FileText, Inbox, LayoutDashboard, Share2, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/layout/logout-button';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/brokers', label: 'Brokers', icon: Users },
  { href: '/form', label: 'Lead Form', icon: FileText },
  { href: '/distribution', label: 'Distribution', icon: Share2 },
  { href: '/leads', label: 'Leads', icon: Inbox },
] as const;

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-card">
      <div className="border-b px-4 py-5">
        <p className="text-sm font-semibold">Lead Distribution</p>
        <p className="text-xs text-muted-foreground">Admin</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t p-3">
        <p className="truncate px-3 text-xs text-muted-foreground">{userEmail}</p>
        <LogoutButton />
      </div>
    </aside>
  );
}
