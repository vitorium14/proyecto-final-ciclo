import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { EmployeeGuard } from '../auth/employee.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component'; // Added import
import { RoomManagementComponent } from './room-management/room-management.component'; // Added import
import { ReservationManagementComponent } from './reservation-management/reservation-management.component'; // Added import
import { ServiceManagementComponent } from './service-management/service-management.component'; // Added import

export const ADMIN_ROUTES: Routes = [
  {
    path: '', // Base path for this module will be defined in app.routes.ts
    component: AdminLayoutComponent,
    canActivate: [EmployeeGuard], // Protect all child routes
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserManagementComponent }, // Added user management route
      { path: 'rooms', component: RoomManagementComponent }, // Added room management route
      { path: 'reservations', component: ReservationManagementComponent }, // Added reservation management route
      { path: 'services', component: ServiceManagementComponent }, // Added service management route
      // Add routes for other CRUD components here later (Phase 4)

      // Redirect base path within admin section to dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];