'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiClientError, apiFetch } from '@/lib/api/client';

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().pipe(z.email('Enter a valid email address')),
  phone: z
    .string()
    .trim()
    .min(5, 'Enter a valid phone number')
    .max(32)
    .regex(/^\+?[0-9()\-\s.]+$/, 'Enter a valid phone number'),
});

type LeadValues = z.infer<typeof leadSchema>;

export function PublicLeadForm({ slug }: { slug: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadValues>({ resolver: zodResolver(leadSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await apiFetch(`/api/public/forms/${encodeURIComponent(slug)}/leads`, {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.',
      );
    }
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="size-10 text-emerald-600" />
        <p className="text-lg font-medium">Thank you!</p>
        <p className="text-sm text-muted-foreground">
          Your submission has been received.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="lead-name">Name</Label>
        <Input id="lead-name" autoComplete="name" placeholder="Your full name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead-email">Email</Label>
        <Input
          id="lead-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead-phone">Phone</Label>
        <Input
          id="lead-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+63 917 000 0000"
          {...register('phone')}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting…' : 'Submit'}
      </Button>
    </form>
  );
}
