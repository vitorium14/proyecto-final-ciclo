import { User } from './user.model';
import { Room } from './room.model';

export interface Reservation {
  id: number;
  // Assuming the backend provides nested objects or enough details
  // Adjust these types if the backend provides only IDs
  client: Pick<User, 'id' | 'fullName' | 'email'>; // Or define a specific Client DTO
  room: Pick<Room, 'id' | 'number'>; // Or define a specific Room DTO
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  status: string; // e.g., 'pending', 'confirmed', 'cancelled', 'checked-in', 'checked-out'
  createdAt?: string | Date; // Optional, from backend
  checkedInAt?: string | Date; // Optional, ISO date string or Date object
  checkedOutAt?: string | Date; // Optional, ISO date string or Date object
  // Add other relevant fields if needed, e.g., totalPrice
}