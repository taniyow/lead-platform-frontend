'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiClientError, apiFetch } from '@/lib/api/client';
import { WEEK_DAYS, type Broker } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const TIMEZONES: string[] =
  typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be a valid time in HH:mm format');

const brokerFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    active: z.boolean(),
    dailyCap: z.number('Daily cap is required').int().min(0, 'Daily cap cannot be negative'),
    timezone: z
      .string()
      .min(1, 'Timezone is required')
      .refine(
        (tz) => TIMEZONES.length === 0 || TIMEZONES.includes(tz),
        'Must be a valid IANA timezone (e.g. Asia/Manila)',
      ),
    openingTime: timeSchema,
    closingTime: timeSchema,
    workingDays: z.array(z.enum(WEEK_DAYS)).min(1, 'Select at least one working day'),
  })
  .refine((value) => value.openingTime !== value.closingTime, {
    message: 'Opening and closing time cannot be equal',
    path: ['closingTime'],
  });

type BrokerFormValues = z.infer<typeof brokerFormSchema>;

export function BrokerForm({ broker }: { broker?: Broker }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = broker !== undefined;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BrokerFormValues>({
    resolver: zodResolver(brokerFormSchema),
    defaultValues: broker
      ? {
          name: broker.name,
          active: broker.active,
          dailyCap: broker.dailyCap,
          timezone: broker.timezone,
          openingTime: broker.openingTime,
          closingTime: broker.closingTime,
          workingDays: [...broker.workingDays],
        }
      : {
          name: '',
          active: true,
          dailyCap: 10,
          timezone: 'Asia/Manila',
          openingTime: '09:00',
          closingTime: '18:00',
          workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      if (isEdit) {
        await apiFetch(`/api/brokers/${broker.id}`, {
          method: 'PATCH',
          body: JSON.stringify(values),
        });
        toast.success('Broker updated');
      } else {
        await apiFetch('/api/brokers', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        toast.success('Broker created');
      }
      router.push('/brokers');
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.',
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Broker name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <Select
                value={field.value ? 'active' : 'inactive'}
                onValueChange={(value) => field.onChange(value === 'active')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dailyCap">Daily cap</Label>
          <Input
            id="dailyCap"
            type="number"
            min={0}
            {...register('dailyCap', { valueAsNumber: true })}
          />
          {errors.dailyCap && <p className="text-sm text-destructive">{errors.dailyCap.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" list="timezone-options" {...register('timezone')} />
          <datalist id="timezone-options">
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz} />
            ))}
          </datalist>
          {errors.timezone && <p className="text-sm text-destructive">{errors.timezone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="openingTime">Opening time</Label>
          <Input id="openingTime" type="time" {...register('openingTime')} />
          {errors.openingTime && (
            <p className="text-sm text-destructive">{errors.openingTime.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="closingTime">Closing time</Label>
          <Input id="closingTime" type="time" {...register('closingTime')} />
          {errors.closingTime && (
            <p className="text-sm text-destructive">{errors.closingTime.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Working days</Label>
        <Controller
          control={control}
          name="workingDays"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const selected = field.value.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      field.onChange(
                        selected
                          ? field.value.filter((d) => d !== day)
                          : [...field.value, day],
                      )
                    }
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.workingDays && (
          <p className="text-sm text-destructive">{errors.workingDays.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create broker'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/brokers')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
