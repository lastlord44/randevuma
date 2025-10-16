// Multi-tenant ve randevu sistemi için tip tanımlamaları

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'staff' | 'customer';
  tenantId: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  tenantId: string;
  customerId: string;
  staffId?: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  duration: number; // dakika cinsinden
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  id: string;
  tenantId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: Pazar, 6: Cumartesi
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  isOpen: boolean;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
