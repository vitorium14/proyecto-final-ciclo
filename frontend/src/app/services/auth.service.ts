import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/login`, loginData)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(error => {
          console.error('Login error', error);
          return throwError(() => new Error(error.error?.message || 'Error en el inicio de sesión'));
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/register`, userData)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(error => {
          console.error('Registration error', error);
          return throwError(() => new Error(error.error?.message || 'Error en el registro'));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogin(): void {
    const userData = this.getUserFromLocalStorage();
    if (!userData) {
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return;
    }
    
    this.currentUserSubject.next(userData);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    
    // Si user.roles existe, usamos ese array
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.includes(role);
    }
    
    // Si user.role existe como string, verificamos si coincide
    if (user.roles) {
      return user.roles === role;
    }
    
    return false;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isEmployee(): boolean {
    return this.hasRole('ROLE_EMPLOYEE') || this.isAdmin();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private handleAuthentication(authResponse: AuthResponse): void {
    const { token, refreshToken, user } = authResponse;
    
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    this.currentUserSubject.next(user);
  }

  private getUserFromLocalStorage(): User | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
}
