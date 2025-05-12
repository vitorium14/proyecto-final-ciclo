import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { LoginPayload, LoginResponse, User, UserCreationPayload } from '../models/api.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // TODO: Replace with your actual API endpoint
    private apiUrl = environment.apiUrl; // TODO: Change to environment variable
    private httpClient = inject(HttpClient);
    private router = inject(Router);

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor() { 
        // Verificar token al iniciar el servicio
        if (this.hasToken()) {
            this.validateToken().subscribe(
                isValid => {
                    this.isAuthenticatedSubject.next(isValid);
                    if (!isValid) {
                        this.clearLocalStorage();
                    }
                }
            );
        }
    }

    private hasToken(): boolean {
        return !!localStorage.getItem('authToken');
    }

    // Validar el token actual llamando a un endpoint de verificación
    private validateToken(): Observable<boolean> {
        const token = this.getToken();
        if (!token) {
            return of(false);
        }

        // Aquí idealmente llamarías a un endpoint para validar el token
        // Por ahora simplemente verificamos que exista
        return of(true);
    }

    login(credentials: LoginPayload): Observable<LoginResponse> {
        return this.httpClient.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => {
                    if (response && response.token) {
                        // Guardar token y datos del usuario
                        localStorage.setItem('authToken', response.token);
                        localStorage.setItem('currentUser', JSON.stringify(response.user));
                        this.isAuthenticatedSubject.next(true);
                    } else {
                        this.isAuthenticatedSubject.next(false);
                        throw new Error('Login fallido: No se recibió un token');
                    }
                }),
                catchError(error => {
                    this.isAuthenticatedSubject.next(false);
                    console.error('Login error:', error);
                    return throwError(() => new Error('Credenciales incorrectas'));
                })
            );
    }

    // Registro de usuarios
    register(userData: UserCreationPayload): Observable<User> {
        return this.httpClient.post<User>(`${this.apiUrl}/register`, userData);
    }

    logout(): void {
        this.clearLocalStorage();
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
    }

    private clearLocalStorage(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }
} 