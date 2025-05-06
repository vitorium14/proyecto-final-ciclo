export interface Room {
  id: number;
  number: string;
  roomType: RoomType;
  status?: RoomStatus;
}

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance'
}

export interface RoomType {
  id: number;
  name: string;
  price: number;
  amenities?: string;
  images?: Image[];
}

export interface Image {
  id: number;
  path: string;
  roomType?: RoomType;
}

export interface RoomResponse {
  rooms: Room[];
  total: number;
}

export interface RoomTypeResponse {
  room_types: RoomType[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface RoomFilterOptions {
  roomTypeId?: number;
  status?: RoomStatus;
  page?: number;
  limit?: number;
  searchTerm?: string;
} 