import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    Booking,
    BookingCreationPayload,
    BookingUpdatePayload
} from '../models/api.model';
import { environment } from '../../environments/environment.prod';
@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = environment.apiUrl + '/bookings'; // Assuming a global proxy is configured

    constructor(private http: HttpClient) { }

    getAllBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(this.apiUrl);
    }

    getBookingById(id: number): Observable<Booking> {
        return this.http.get<Booking>(`${this.apiUrl}/${id}`);
    }

    getBookingsByUserId(userId: number): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
    }

    createBooking(payload: BookingCreationPayload): Observable<Booking> {
        return this.http.post<Booking>(this.apiUrl, payload);
    }

    updateBooking(id: number, payload: BookingUpdatePayload): Observable<Booking> {
        return this.http.put<Booking>(`${this.apiUrl}/${id}`, payload);
    }

    deleteBooking(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
} 