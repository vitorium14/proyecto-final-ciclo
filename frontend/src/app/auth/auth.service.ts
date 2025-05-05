import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs'; // Added BehaviorSubject
import { catchError, map, tap } from 'rxjs/operators'; // Added tap
import { jwtDecode } from 'jwt-decode'; // Added jwt-decode import

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  // Store decoded token payload
  private decodedTokenSubject = new BehaviorSubject<any | null>(null);
  decodedToken$ = this.decodedTokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Decode token on service initialization if it exists
    this.decodeTokenFromStorage();
  }

  private decodeToken(token: string): any | null {
    try {
      const decoded = jwtDecode(token);
      this.decodedTokenSubject.next(decoded);
      return decoded;
    } catch (error) {
      console.error('Failed to decode token:', error);
      this.decodedTokenSubject.next(null); // Clear decoded token on error
      localStorage.removeItem('token'); // Remove invalid token
      return null;
    }
  }

  private decodeTokenFromStorage(): void {
    const token = this.getToken();
    if (token) {
      this.decodeToken(token);
    } else {
      this.decodedTokenSubject.next(null);
    }
  }

  login(email: string, password: string): Observable<string> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => { // Use tap to perform side effects without altering the stream
        localStorage.setItem('token', res.token);
        this.decodeToken(res.token); // Decode and store payload
      }),
      map(res => res.token), // Map to return only the token string
      catchError(this.handleError)
    );
  }

  register(email: string, password: string, fullname: string, phone: string, dni: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password, fullname, phone, dni }).pipe(
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.decodedTokenSubject.next(null); // Clear decoded token
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
  // Removed extra closing brace here

  // Method to check roles from decoded token
  hasRole(requiredRoles: string | string[]): boolean {
    const decoded = this.decodedTokenSubject.getValue();
    if (!decoded || !decoded.roles || !Array.isArray(decoded.roles)) {
      return false; // No token or roles claim found
    }

    const userRoles: string[] = decoded.roles;
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Check if user has at least one of the required roles
    return rolesToCheck.some(role => userRoles.includes(role));
  }

  // Optional: Method to get the raw decoded token if needed elsewhere
  getDecodedToken(): any | null {
    return this.decodedTokenSubject.getValue();
  }
}