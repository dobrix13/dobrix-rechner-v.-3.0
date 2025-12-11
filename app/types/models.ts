// Shared TypeScript interfaces for dashboard models

export interface Organization {
  _id: string;
  name: string;
  owner?: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  organization: string | Organization;
  initialFloat?: number;
  teamTipPercentage?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'org_admin' | 'manager' | 'kellner';
  organizationId?: string;
  organization?: Organization;
  restaurantId?: string;
  restaurant?: Restaurant;
}

export interface Abrechnung {
  _id: string;
  userId: string;
  organization: string;
  restaurant: string;
  totalSales?: number;
  salesInCash?: number;
  teamTips?: number;
  teamTipsPaid?: number;
  date: string;
  geschaefts_tag?: string; // Business day (calculated: before 06:00 = previous day, after 06:00 = current day)
}
