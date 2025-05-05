import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Import Service model later
// import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = 'http://localhost:8000/api/services';

  constructor(private http: HttpClient) {}

  // GET /api/services - Public
  getServices(): Observable<any[]> { // Replace 'any' with Service model
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/services/{id} - Public
  getService(id: number): Observable<any> { // Replace 'any' with Service model
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // POST /api/services - Employee/Admin only
  createService(serviceData: any): Observable<any> { // Replace 'any' with Service model/create DTO
    // Needs name, price, optional description
    return this.http.post<any>(this.apiUrl, serviceData).pipe(
      catchError(this.handleError)
    );
  }

  // PATCH /api/services/{id} - Employee/Admin only
  updateService(id: number, serviceData: any): Observable<any> { // Replace 'any' with Service model/update DTO
    return this.http.patch<any>(`${this.apiUrl}/${id}`, serviceData).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE /api/services/{id} - Employee/Admin only
  deleteService(id: number): Observable<any> {
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