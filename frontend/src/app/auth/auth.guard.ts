import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router); // Inyección directa (Angular >=14)

  // Comprobación básica: verifica si hay un token en el localStorage
  const isAuthenticated = !!sessionStorage.getItem('token');

  if (!isAuthenticated) {
    // Si no hay token, redirige a la página de login
    router.navigate(['/login']);
    return false;
  }

  // Si el usuario está autenticado, permite el acceso a la ruta
  return true;
};
