export interface Service {
  id?: number; // Make ID optional
  name: string;
  description: string;
  price: number;
  duration: number; // Duration in minutes, 0 if not applicable
  category: string; // e.g., 'wellness', 'food', 'activity', 'amenity'
  image?: string; // Optional URL for the service image
}