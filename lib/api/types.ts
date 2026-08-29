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

export interface LeadForm {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistributionBrokerConfig {
  brokerId: number;
  name: string;
  brokerActive: boolean;
  active: boolean;
  percentage: number;
  dailyCap: number;
  timezone: string;
  openingTime: string;
  closingTime: string;
  workingDays: WeekDay[];
}

export interface Distribution {
  id: number;
  formId: number;
  formName: string;
  formSlug: string;
  createdAt: string;
  brokers: DistributionBrokerConfig[];
  totalPercentage: number;
}

export interface DistributionLead {
  id: number;
  name: string;
  normalizedEmail: string;
  phone: string;
  ipAddress: string;
  formName: string;
  brokerName: string | null;
  status: LeadStatus;
  createdAt: string;
  assignedAt: string | null;
}

export interface AdminLead {
  id: number;
  name: string;
  normalizedEmail: string;
  phone: string;
  ipAddress: string;
  formName: string;
  brokerName: string | null;
  status: LeadStatus;
  createdAt: string;
  assignedAt: string | null;
}

export interface DashboardBrokerStat {
  id: number;
  name: string;
  active: boolean;
  inDistribution: boolean;
  distributionActive: boolean;
  percentage: number | null;
  dailyCap: number;
  sentToday: number;
  openNow: boolean;
}

export interface DashboardStats {
  leadCounts: {
    total: number;
    sent: number;
    unsent: number;
    duplicate: number;
    failed: number;
  };
  brokers: DashboardBrokerStat[];
  form: { id: number; name: string; slug: string } | null;
  distribution: { id: number; createdAt: string } | null;
}
