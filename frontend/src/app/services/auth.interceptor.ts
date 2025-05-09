import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service'; // Import AuthService

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private authService: AuthService // Inject AuthService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getToken(); // Retrieve token from AuthService

        let authReq = req;
        if (token) {
            authReq = req.clone({
                setHeaders: {
                    Authorization: `${token}`
                }
            });
        }

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // Token might be expired or invalid
                    // Optional: try to refresh token here if you have a refresh token mechanism
                    // For now, just log out and redirect to login
                    console.error('Unauthorized request, logging out.');
                    this.authService.logout(); // Use AuthService to logout
                    // this.router.navigate(['/login']); // Navigation is handled by authService.logout()
                }
                return throwError(() => error);
            })
        );
    }
} 