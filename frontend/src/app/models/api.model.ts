// TypeScript Models converted from PHP Entities

// User Model
export interface User {
    id: number;
    name: string;
    surnames: string;
    email: string;
    role: string;
    bookings: Booking[];
}

// Payload for creating a User
export interface UserCreationPayload {
    name: string;
    surnames: string;
    email: string;
    password: string;
    role: string;
}

// Payload for updating a User
export interface UserUpdatePayload {
    name?: string;
    surnames?: string;
    email?: string;
    password?: string;
    role?: string;
}

// Image Model
export interface Image {
    id: number;
    image: string; // BASE64 encoded image
}

// Service Model
export interface Service {
    id: number;
    name: string;
    description?: string;
    price?: string;
    duration?: number;
    images: Image[];
}

// RoomType Model
export interface RoomType {
    id: number;
    name: string;
    description: string;
    price: string;
    capacity: number;
    amenities: string[];
    images: Image[];
    rooms: Room[];
}

// Room Model
export interface Room {
    id: number;
    name: string;
    type: RoomType;
    status: string;
    observations?: string;
    bookings: Booking[];
}

// Booking Model
export interface Booking {
    id: number;
    user: User;
    services: Service[];
    price: string;
    checkIn: string;
    checkOut: string;
    checkedIn: boolean;
    checkedOut: boolean;
    room: Room;
}
