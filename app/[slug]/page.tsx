import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicLeadForm } from '@/components/leads/public-lead-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:4001';

export const metadata: Metadata = {
  title: 'Lead Form',
};

interface PublicForm {
  id: number;
  name: string;
  slug: string;
}

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const response = await fetch(`${BACKEND_URL}/api/public/forms/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    notFound();
  }
  const body = (await response.json()) as { data: { form: PublicForm } | null };
  const form = body.data?.form;
  if (!form) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{form.name}</CardTitle>
          <CardDescription>Fill in your details and we will get in touch.</CardDescription>
        </CardHeader>
        <CardContent>
          <PublicLeadForm slug={form.slug} />
        </CardContent>
      </Card>
    </main>
  );
}
