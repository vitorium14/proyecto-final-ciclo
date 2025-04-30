import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirigir rutas desconocidas a Home
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
