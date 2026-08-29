export const WEEK_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export type LeadStatus = 'sent' | 'unsent' | 'duplicate' | 'failed';

export interface Broker {
  id: number;
  name: string;
  active: boolean;
  dailyCap: number;
  timezone: string;
  openingTime: string;
  closingTime: string;
  workingDays: WeekDay[];
  createdAt: string;
  updatedAt: string;
}

export interface BrokerLead {
  id: number;
  name: string;
  normalizedEmail: string;
  phone: string;
  ipAddress: string;
  formName: string;
  receivedAt: string | null;
  status: LeadStatus;
}
