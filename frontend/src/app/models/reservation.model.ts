import { User } from './user.model';
import { Room } from './room.model';
import { Service } from './service.model';

export interface Reservation {
  id: number;
  user: User;
  room: Room;
  checkIn: Date;
  checkOut: Date;
  status: ReservationStatus;
  totalPrice: number;
  additionalServices?: ReservationService[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled'
}

export interface ReservationService {
  service: Service;
  quantity: number;
  price: number;
}

export interface ReservationResponse {
  reservations: Reservation[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ReservationFilterOptions {
  userId?: number;
  roomId?: number;
  status?: ReservationStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface CreateReservationRequest {
  roomId: number;
  checkIn: Date;
  checkOut: Date;
  additionalServices?: {
    serviceId: number;
    quantity: number;
  }[];
  notes?: string;
}

export interface UpdateReservationRequest {
  status?: ReservationStatus;
  checkIn?: Date;
  checkOut?: Date;
  additionalServices?: {
    serviceId: number;
    quantity: number;
  }[];
  notes?: string;
} 