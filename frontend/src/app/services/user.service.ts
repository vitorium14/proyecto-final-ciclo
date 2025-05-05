import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model'; // Import User model

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Ideally, get this from AuthService or environment config
  private apiUrl = 'http://localhost:8000/api/users';

  constructor(private http: HttpClient) {}

  // GET /api/users - Admin only
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/users/{id} - Admin or Self
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // PATCH /api/users/{id} - Admin only
  // Use Partial<User> for userData as we might only send updated fields
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE /api/users/{id} - Admin only
  // DELETE often returns no content (204) or an empty object
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
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