import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Import Reservation model later
// import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8000/api/reservations';

  constructor(private http: HttpClient) {}

  // GET /api/reservations - Employee/Admin only
  getAllReservations(): Observable<any[]> { // Replace 'any' with Reservation model
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/reservations/my - Authenticated user (self)
  getMyReservations(): Observable<any[]> { // Replace 'any' with Reservation model
    return this.http.get<any[]>(`${this.apiUrl}/my`).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/reservations/{id} - Owner or Employee/Admin
  getReservation(id: number): Observable<any> { // Replace 'any' with Reservation model
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // POST /api/reservations - Authenticated user
  createReservation(reservationData: any): Observable<any> { // Replace 'any' with create DTO
    // Needs roomId, checkIn, checkOut
    return this.http.post<any>(this.apiUrl, reservationData).pipe(
      catchError(this.handleError)
    );
  }

  // PATCH /api/reservations/{id} - Employee/Admin only
  updateReservation(id: number, reservationData: any): Observable<any> { // Replace 'any' with update DTO
    return this.http.patch<any>(`${this.apiUrl}/${id}`, reservationData).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE /api/reservations/{id} - Employee/Admin only
  deleteReservation(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
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