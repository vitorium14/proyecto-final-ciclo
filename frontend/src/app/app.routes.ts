import { Routes } from '@angular/router';
import { HomeComponent } from './public/home/home.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { ContactComponent } from './public/contact/contact.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { EmployeeLoginComponent } from './auth/employee-login/employee-login.component'; // Added import
import { AuthGuard } from './auth/auth.guard';
import { RoomsComponent } from './public/rooms/rooms.component'; // Import the new component

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'auth/login', component: LoginComponent },
      { path: 'auth/register', component: RegisterComponent },
      { path: 'employee/login', component: EmployeeLoginComponent }, // Added comma
      { path: 'rooms', component: RoomsComponent } // Corrected route definition
      // Ejemplo de ruta privada protegida:
      // { path: 'reservas', component: ReservasComponent, canActivate: [AuthGuard] }
    ]
  },
  // Lazy-loaded admin/employee section routes
  {
    path: 'employee',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
    // The EmployeeGuard is applied within admin.routes.ts
  }
];
