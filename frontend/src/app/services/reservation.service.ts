import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Reservation } from '../models/reservation.model'; // Import Reservation model
import { PublicReservationSuccessResponse } from '../models/reservation-response.model'; // Import success response type

// Define the expected payload structure for the public endpoint
export interface PublicReservationPayload {
  checkIn: string;
  checkOut: string;
  roomType: string;
  fullName: string;
  email: string;
  password?: string; // Password is required by backend logic
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8000/api/reservations';

  constructor(private http: HttpClient) {}

  // GET /api/reservations - Employee/Admin only
  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/reservations/my - Authenticated user (self)
  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/my`).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/reservations/{id} - Owner or Employee/Admin
  getReservation(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // POST /api/reservations - Authenticated user
  // Define a specific CreateReservationDTO or use Pick/Omit
  // Assuming roomId, checkIn, checkOut are needed
  createReservation(reservationData: { roomId: number; checkIn: string; checkOut: string; /* add other required fields */ }): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservationData).pipe(
      catchError(this.handleError)
    );
  }

  // PATCH /api/reservations/{id} - Employee/Admin only
  // Use Partial<Reservation> or a specific UpdateReservationDTO
  updateReservation(id: number, reservationData: Partial<Reservation>): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}`, reservationData).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE /api/reservations/{id} - Employee/Admin only
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // POST /api/reservations/public - Public access
  createPublicReservation(payload: PublicReservationPayload): Observable<PublicReservationSuccessResponse> {
    return this.http.post<PublicReservationSuccessResponse>(`${this.apiUrl}/public`, payload).pipe(
      catchError(this.handleError) // Reuse existing error handler
    );
  }

  // Basic error handling (could be centralized)
  private handleError(error: HttpErrorResponse) {
    let msg = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      msg = `Error: ${error.error.message}`;
    } else {
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        msg = error.error.message;
      }
    }
    console.error(error);
    return throwError(() => new Error(msg));
  }
}