import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, ReservationFilterOptions, ReservationResponse } from '../models/reservation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private baseUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) { }

  // Reservation CRUD operations
  getReservations(filters?: ReservationFilterOptions): Observable<ReservationResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.roomId) params = params.set('roomId', filters.roomId.toString());
      if (filters.userId) params = params.set('userId', filters.userId.toString());
      if (filters.status) params = params.set('status', filters.status);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.searchTerm) params = params.set('search', filters.searchTerm);
    }
    
    return this.http.get<ReservationResponse>(this.baseUrl, { params });
  }

  getReservation(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.baseUrl}/${id}`);
  }

  createReservation(reservation: Partial<Reservation>): Observable<Reservation> {
    return this.http.post<Reservation>(this.baseUrl, reservation);
  }

  createPublicReservation(reservationData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/public`, reservationData);
  }

  updateReservation(id: number, reservation: Partial<Reservation>): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.baseUrl}/${id}`, reservation);
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Additional operations if needed, e.g., cancel reservation
  cancelReservation(id: number): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.baseUrl}/${id}/cancel`, {});
  }
} 