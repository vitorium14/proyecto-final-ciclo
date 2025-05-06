import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    return this.checkLogin(state.url);
  }
  
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    return this.canActivate(childRoute, state);
  }
  
  private checkLogin(url: string): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    // Store the attempted URL for redirecting
    // localStorage.setItem('redirectUrl', url);
    
    // Navigate to the login page
    this.router.navigate(['/login']);
    return false;
  }
}
