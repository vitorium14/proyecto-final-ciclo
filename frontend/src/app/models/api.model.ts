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
    description: string;
    price: string;
    duration?: number | null;
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

// --- Payload Interfaces for Create/Update Operations ---

// Image Upload Payload (for RoomType, Service creation/update)
export interface ImageUploadPayload {
    image: string; // BASE64 encoded image (no id needed for new images)
}

// Room Payloads
export interface RoomCreationPayload {
    name: string;
    type: number; // RoomType ID
    status: string;
    observations?: string;
}

export interface RoomUpdatePayload {
    name?: string;
    type?: number; // RoomType ID
    status?: string;
    observations?: string;
}

// RoomType Payloads
export interface RoomTypeCreationPayload {
    name: string;
    description: string;
    price: string;
    capacity: number;
    amenities: string[];
    images: ImageUploadPayload[]; // Array of new images
}

export interface RoomTypeUpdatePayload {
    name?: string;
    description?: string;
    price?: string;
    capacity?: number;
    amenities?: string[];
    images?: ImageUploadPayload[]; // Array of new images (replaces all existing)
}

// Service Payloads (Hotel Service)
export interface ServiceCreationPayload {
    name: string;
    description: string;
    price: string;
    duration?: number | null;
    images: ImageUploadPayload[]; // Array of new images
}

export interface ServiceUpdatePayload {
    name?: string;
    description?: string;
    price?: string;
    duration?: number | null;
    images?: ImageUploadPayload[]; // Array of new images (replaces all existing)
}

// Booking Payloads
export interface BookingCreationPayload {
    user: number; // User ID
    services: number[]; // Array of Service IDs
    checkIn: string; // Format: "YYYY-MM-DD HH:MM:SS"
    checkOut: string; // Format: "YYYY-MM-DD HH:MM:SS"
    checkedIn?: boolean; // Defaults to false
    checkedOut?: boolean; // Defaults to false
    room: number; // Room ID (will be ignored when using roomType)
    roomType: number; // Room Type ID (new field for automatic room assignment)
    duration: number; // Duration of stay in nights
}

export interface BookingUpdatePayload {
    user: number; // User ID
    services: number[]; // Array of Service IDs
    checkIn: string; // Format: "YYYY-MM-DD HH:MM:SS"
    checkOut: string; // Format: "YYYY-MM-DD HH:MM:SS"
    checkedIn?: boolean;
    checkedOut?: boolean;
    room: number; // Room ID (will be ignored when using roomType)
    roomType?: number; // Room Type ID for automatic room assignment
    duration: number; // Duration of stay in nights
}

// --- Auth Specific Payloads and Responses ---

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface LogoutPayload {
    token: string; // Token to be invalidated
}

export interface LogoutResponse {
    message: string;
}
