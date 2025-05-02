import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<string> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(res => {
        localStorage.setItem('token', res.token);
        return res.token;
      }),
      catchError(this.handleError)
    );
  }

  register(email: string, password: string, fullname: string, phone: string, dni: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password, fullname, phone, dni }).pipe(
      catchError(this.handleError)
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private handleError(error: HttpErrorResponse) {
    let msg = 'Error desconocido';
    if (error.error && error.error.message) {
      msg = error.error.message;
    } else if (error.status === 0) {
      msg = 'No se pudo conectar con el servidor';
    } else if (error.error && typeof error.error === 'string') {
      msg = error.error;
    }
    return throwError(() => msg);
  }
}