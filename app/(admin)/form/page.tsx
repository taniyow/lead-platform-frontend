import type { Metadata } from 'next';
import { CopyButton } from '@/components/copy-button';
import { FormCreateForm } from '@/components/forms/form-create-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { backendFetch } from '@/lib/api/server';
import type { LeadForm } from '@/lib/api/types';
import { requireSession } from '@/lib/auth/session';
import { formatDateTime } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Lead Form — Lead Distribution Platform',
};

export default async function FormPage() {
  await requireSession();
  const { form } = await backendFetch<{ form: LeadForm | null }>('/api/forms');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Lead Form</h1>
        <p className="text-sm text-muted-foreground">
          Only one lead form can exist. Visitors submit leads through its public URL.
        </p>
      </div>

      {form ? (
        <Card>
          <CardHeader>
            <CardTitle>{form.name}</CardTitle>
            <CardDescription>Created {formatDateTime(form.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Public form URL</p>
                <p className="font-mono text-sm">/{form.slug}</p>
              </div>
              <CopyButton relativeUrl={`/${form.slug}`} />
            </div>
            <p className="text-xs text-muted-foreground">
              A second form cannot be created — this platform allows exactly one lead form.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create the lead form</CardTitle>
            <CardDescription>
              The form collects name, email, and phone from visitors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormCreateForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
