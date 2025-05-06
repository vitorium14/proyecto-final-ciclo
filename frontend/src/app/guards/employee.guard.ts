import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeGuard implements CanActivate, CanActivateChild {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    return this.checkEmployee();
  }
  
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    return this.canActivate(childRoute, state);
  }
  
  private checkEmployee(): boolean {
    if (this.authService.isAuthenticated() && this.authService.isEmployee()) {
      return true;
    }
    
    // If not authenticated, redirect to login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    
    // If authenticated but not an employee/admin, redirect to home
    this.router.navigate(['/']);
    return false;
  }
}
