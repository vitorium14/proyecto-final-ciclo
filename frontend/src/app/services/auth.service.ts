import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { LoginPayload, LoginResponse } from '../models/api.model'; // Assuming these models exist

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // TODO: Replace with your actual API endpoint
    private apiUrl = 'http://localhost:8000/api';
    private httpClient = inject(HttpClient);
    private router = inject(Router);

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor() { }

    private hasToken(): boolean {
        return !!localStorage.getItem('authToken');
    }

    login(credentials: LoginPayload): Observable<LoginResponse> {
        return this.httpClient.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => {
                    if (response && response.token) {
                        localStorage.setItem('authToken', response.token);
                        // Optionally store user details if needed
                        // localStorage.setItem('currentUser', JSON.stringify(response.user)); 
                        this.isAuthenticatedSubject.next(true);
                    } else {
                        // Handle cases where token is not in response
                        this.isAuthenticatedSubject.next(false);
                        throw new Error('Login failed: No token received');
                    }
                }),
                catchError(error => {
                    this.isAuthenticatedSubject.next(false);
                    // TODO: Implement more specific error handling (e.g., display error message to user)
                    console.error('Login error:', error);
                    return throwError(() => new Error('Login failed'));
                })
            );
    }

    logout(): void {
        localStorage.removeItem('authToken');
        // localStorage.removeItem('currentUser'); // Also remove user details if stored
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']); // Or your desired logout redirect path
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    // Optional: Method to get current user details if stored
    // getCurrentUser(): User | null {
    //   const user = localStorage.getItem('currentUser');
    //   return user ? JSON.parse(user) : null;
    // }
} 