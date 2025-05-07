export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration?: number; // Duración en minutos, opcional
  images?: Image[];
}

export interface ServiceResponse {
  services: Service[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ServiceFilterOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
} 