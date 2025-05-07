import { Image } from './room.model';

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  status: ServiceStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  duration?: number; // Duración en minutos, opcional
  images?: Image[];
}

export type ServiceStatus = 'available' | 'unavailable' | 'seasonal';

export interface ServiceResponse {
  services: Service[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ServiceFilterOptions {
  active?: boolean;
  status?: ServiceStatus;
  category?: string;
  page?: number;
  limit?: number;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
} 