'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiClientError, apiFetch } from '@/lib/api/client';

const formSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug may only contain lowercase letters, numbers, and hyphens',
    ),
});

type FormValues = z.infer<typeof formSchema>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function FormCreateForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', slug: '' },
  });

  const slug = watch('slug');

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await apiFetch('/api/forms', { method: 'POST', body: JSON.stringify(values) });
      toast.success('Lead form created');
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.',
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="form-name">Form name</Label>
        <Input
          id="form-name"
          placeholder="Lead Registration"
          {...register('name', {
            onChange: (event) => {
              if (!slugEdited) {
                setValue('slug', slugify(event.target.value), { shouldValidate: false });
              }
            },
          })}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-slug">Public URL slug</Label>
        <Input
          id="form-slug"
          placeholder="lead-registration"
          {...register('slug', { onChange: () => setSlugEdited(true) })}
        />
        <p className="text-xs text-muted-foreground">
          The public form will be available at <span className="font-mono">/{slug || '{slug}'}</span>
        </p>
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating…' : 'Create form'}
      </Button>
    </form>
  );
}
