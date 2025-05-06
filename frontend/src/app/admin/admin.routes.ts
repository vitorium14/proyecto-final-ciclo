import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { EmployeeGuard } from '../auth/employee.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component'; // Added import
import { RoomManagementComponent } from './room-management/room-management.component'; // Added import
import { ReservationManagementComponent } from './reservation-management/reservation-management.component'; // Added import
import { ServiceManagementComponent } from './service-management/service-management.component'; // Added import
import { AdminCalendarComponent } from './admin-calendar/admin-calendar.component'; // Added import
import { CheckinCheckoutComponent } from './checkin-checkout/checkin-checkout.component'; // Added import

export const ADMIN_ROUTES: Routes = [
  {
    path: '', // Base path for this module will be defined in app.routes.ts
    component: AdminLayoutComponent,
    canActivate: [EmployeeGuard], // Protect all child routes
    children: [
      // { path: 'dashboard', component: DashboardComponent }, // Old dashboard, will become statistics
      { path: 'calendar', component: AdminCalendarComponent }, // Main admin view
      { path: 'statistics', component: DashboardComponent }, // Statistics page (using old DashboardComponent)
      { path: 'users', component: UserManagementComponent },
      { path: 'rooms', component: RoomManagementComponent },
      { path: 'reservations', component: ReservationManagementComponent },
      { path: 'services', component: ServiceManagementComponent },
      { path: 'checkin-checkout', component: CheckinCheckoutComponent },
      // Add routes for other CRUD components here later (Phase 4)

      // Redirect base path within admin section to calendar
      { path: '', redirectTo: 'calendar', pathMatch: 'full' },
      { path: 'dashboard', redirectTo: 'calendar', pathMatch: 'full' } // Redirect old dashboard path
    ]
  }
];