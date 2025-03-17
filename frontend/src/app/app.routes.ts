import { Routes } from '@angular/router';
import { HomeComponent } from './public/home/home.component';
import { RoomsPublicComponent } from './public/rooms/rooms.component';
import { RoomDetailComponent } from './public/room-detail/room-detail.component';
import { ContactComponent } from './public/contact/contact.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';
import { CheckInOutComponent } from './admin/check-in-out/check-in-out.component';
import { ReservationsComponent } from './admin/reservations/reservations.component';
import { ClientsComponent } from './admin/clients/clients.component';
import { LoginComponent } from './auth/login/login.component';
import { RoomsComponent } from './admin/rooms/rooms.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'rooms', component: RoomsPublicComponent },
      { path: 'room/:id', component: RoomDetailComponent },
      { path: 'contact', component: ContactComponent },
      // Login
      { path: 'login', component: LoginComponent },
    ],
  },

  // Rutas privadas (protegidas con AuthGuard)
  {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'check-in-out', component: CheckInOutComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'rooms', component: RoomsComponent },
      { path: '', redirectTo: 'clients', pathMatch: 'full' },
    ],
  },

  // Redirigir rutas desconocidas a Home
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
