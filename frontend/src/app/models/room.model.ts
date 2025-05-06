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
  id?: number;
  image: string; // Esto contendrá la imagen en base64
  path?: string; // Para compatibilidad con API existente
  isNew?: boolean; // Para indicar si es una imagen nueva o existente
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