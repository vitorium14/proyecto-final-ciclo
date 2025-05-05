import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Service } from '../models/service.model'; // Import Service model

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = 'http://localhost:8000/api/services';

  constructor(private http: HttpClient) {}

  // GET /api/services - Public
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/services/{id} - Public
  getService(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // POST /api/services - Employee/Admin only
  // Use Omit<Service, 'id'> for create DTO
  createService(serviceData: Omit<Service, 'id'>): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, serviceData).pipe(
      catchError(this.handleError)
    );
  }

  // PATCH /api/services/{id} - Employee/Admin only
  // Use Partial<Service> for update DTO
  updateService(id: number, serviceData: Partial<Service>): Observable<Service> {
    return this.http.patch<Service>(`${this.apiUrl}/${id}`, serviceData).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE /api/services/{id} - Employee/Admin only
  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
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