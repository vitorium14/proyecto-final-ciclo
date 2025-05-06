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
      { path: 'rooms/:id/edit', component: RoomFormComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
