import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.auth.isLoggedIn()) {
      // Check if the user has the required role(s) using the AuthService
      const hasRequiredRole = this.auth.hasRole(['ROLE_EMPLOYEE', 'ROLE_ADMIN']);

      if (hasRequiredRole) {
        return true; // User is logged in and has the correct role
      } else {
        // Optional: Redirect to an 'unauthorized' page or back to home
        console.warn('User does not have required role for this route.');
        this.router.navigate(['/']); // Redirect to home if role is incorrect
        return false;
      }
    } else {
      // User is not logged in, redirect to employee login page
      console.log('User not logged in, redirecting to employee login.');
      // Store the attempted URL for redirection after login
      // You might want to pass the attempted URL as a query parameter
      this.router.navigate(['/employee/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}