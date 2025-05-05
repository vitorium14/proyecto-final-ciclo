export interface Room {
  id?: number; // Make ID optional as it's assigned by the backend
  number: string;
  type: string; // e.g., 'standard', 'deluxe', 'suite'
  capacity: number;
  price: number;
  status: string; // e.g., 'available', 'occupied', 'maintenance'
  image?: string; // Optional URL for the room image
}