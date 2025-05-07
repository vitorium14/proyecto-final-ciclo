import { User } from './user.model';
import { Room } from './room.model';
import { Service } from './service.model';

export interface Reservation {
  id: number;
  room: Room;
  user: User;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  status: ReservationStatus;
  totalPrice: number;
  observations?: string;
  services?: ReservationService[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface ReservationService {
  service: Service;
  quantity: number;
  price: number;
}

export interface ReservationResponse {
  reservations: Reservation[];
  total: number;
  page: number;
  limit: number;
}

export interface ReservationFilterOptions {
  roomId?: number;
  userId?: number;
  status?: ReservationStatus;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface CreateReservationRequest {
  roomId: number;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  observations?: string;
  services?: {
    id: number;
    quantity: number;
  }[];
}

export interface UpdateReservationRequest {
  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD
  observations?: string;
  services?: {
    id: number;
    quantity: number;
  }[];
} 