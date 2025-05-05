import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Import User model later
// import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Ideally, get this from AuthService or environment config
  private apiUrl = 'http://localhost:8000/api/users';

  constructor(private http: HttpClient) {}

  // GET /api/users - Admin only
  getUsers(): Observable<any[]> { // Replace 'any' with User model
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/users/{id} - Admin or Self
  getUser(id: number): Observable<any> { // Replace 'any' with User model
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // PATCH /api/users/{id} - Admin only
  updateUser(id: number, userData: any): Observable<any> { // Replace 'any' with User model/update DTO
    return this.http.patch<any>(`${this.apiUrl}/${id}`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE /api/users/{id} - Admin only
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Basic error handling (could be centralized)
  private handleError(error: HttpErrorResponse) {
    let msg = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      msg = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        msg = error.error.message; // Use backend's message if available
      }
    }
    console.error(error);
    return throwError(() => new Error(msg));
  }
}