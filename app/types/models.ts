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
  email?: string;
  password?: string;
  role: 'admin' | 'org_admin' | 'manager' | 'kellner';
  organizationId?: string;
  organization?: string | Organization;
  restaurantId?: string;
  restaurant?: string | Restaurant;
  userId?: string; // Alias for _id for compatibility
}

export interface UserSession extends Omit<User, 'password'> {
  organisation?: string; // Organization name (legacy)
  restaurant?: string; // Restaurant name (legacy)
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

export interface ApiError {
  error: string;
  details?: unknown;
}

// Storage keys
export const STORAGE_KEYS = {
  USER_SESSION: 'dobrix_user_session',
} as const;
