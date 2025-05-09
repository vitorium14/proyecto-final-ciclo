import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/api.model';

// Payload type for creating/updating bookings, using IDs for relations
export interface BookingPayload {
    user: number; // User ID
    services: number[]; // Array of Service IDs
    checkIn: string; // Format: YYYY-MM-DD HH:MM:SS
    checkOut: string; // Format: YYYY-MM-DD HH:MM:SS
    checkedIn?: boolean;
    checkedOut?: boolean;
    room: number; // Room ID
    duration?: number; // This was in the example, but price is backend calculated. Verify if needed.
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = '/api/bookings'; // Assuming a global proxy is configured

    constructor(private http: HttpClient) { }

    getAllBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(this.apiUrl);
    }

    getBookingById(id: number): Observable<Booking> {
        return this.http.get<Booking>(`${this.apiUrl}/${id}`);
    }

    createBooking(bookingData: BookingPayload): Observable<Booking> {
        return this.http.post<Booking>(this.apiUrl, bookingData);
    }

    updateBooking(id: number, bookingData: Partial<BookingPayload>): Observable<Booking> {
        return this.http.put<Booking>(`${this.apiUrl}/${id}`, bookingData);
    }

    deleteBooking(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
} 