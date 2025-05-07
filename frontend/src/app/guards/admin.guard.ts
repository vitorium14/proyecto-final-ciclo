import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAdmin = authService.hasRole('ROLE_ADMIN');
  
  if (!isAdmin) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};

export const AdminGuardChild: CanActivateChildFn = (childRoute, state) => {
  return AdminGuard(childRoute, state);
}; 