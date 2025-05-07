import { Routes } from '@angular/router';
import { PublicComponent } from './layout/public/public.component';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { EmployeeGuard } from './guards/employee.guard';
import { RoomListComponent } from './pages/rooms/room-list/room-list.component';
import { RoomFormComponent } from './pages/rooms/room-form/room-form.component';
import { RoomDetailComponent } from './pages/rooms/room-detail/room-detail.component';
import { RoomTypeListComponent } from './pages/room-types/room-type-list/room-type-list.component';
import { RoomTypeFormComponent } from './pages/room-types/room-type-form/room-type-form.component';
import { RoomTypeDetailComponent } from './pages/room-types/room-type-detail/room-type-detail.component';
import { ReservationListComponent } from './pages/reservations/reservation-list/reservation-list.component';
import { ReservationFormComponent } from './pages/reservations/reservation-form/reservation-form.component';
import { ReservationDetailComponent } from './pages/reservations/reservation-detail/reservation-detail.component';
import { ServiceListComponent } from './pages/services/service-list/service-list.component';
import { ServiceFormComponent } from './pages/services/service-form/service-form.component';
import { ServiceDetailComponent } from './pages/services/service-detail/service-detail.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { UserFormComponent } from './pages/users/user-form/user-form.component';
import { UserDetailComponent } from './pages/users/user-detail/user-detail.component';
import { LogListComponent } from './pages/logs/log-list/log-list.component';
import { LogDashboardComponent } from './pages/logs/log-dashboard/log-dashboard.component';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [EmployeeGuard],
    canActivateChild: [EmployeeGuard],
    children: [
      { path: '', component: DashboardHomeComponent, pathMatch: 'full' },
      { path: 'rooms', component: RoomListComponent },
      { path: 'rooms/new', component: RoomFormComponent },
      { path: 'rooms/:id', component: RoomDetailComponent },
      { path: 'rooms/:id/edit', component: RoomFormComponent },
      { path: 'room-types', component: RoomTypeListComponent },
      { path: 'room-types/new', component: RoomTypeFormComponent },
      { path: 'room-types/:id', component: RoomTypeDetailComponent },
      { path: 'room-types/:id/edit', component: RoomTypeFormComponent },
      { path: 'reservations', component: ReservationListComponent },
      { path: 'reservations/new', component: ReservationFormComponent },
      { path: 'reservations/:id', component: ReservationDetailComponent },
      { path: 'reservations/:id/edit', component: ReservationFormComponent },
      { path: 'services', component: ServiceListComponent },
      { path: 'services/new', component: ServiceFormComponent },
      { path: 'services/:id', component: ServiceDetailComponent },
      { path: 'services/:id/edit', component: ServiceFormComponent },
      { 
        path: 'users', 
        canActivate: [AdminGuard],
        canActivateChild: [AdminGuard],
        children: [
          { path: '', component: UserListComponent },
          { path: 'new', component: UserFormComponent },
          { path: ':id', component: UserDetailComponent },
          { path: ':id/edit', component: UserFormComponent }
        ]
      },
      { 
        path: 'logs', 
        canActivate: [AdminGuard],
        canActivateChild: [AdminGuard],
        children: [
          { path: '', component: LogDashboardComponent },
          { path: 'list', component: LogListComponent }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
