import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { UsersComponent } from './pages/users/users.component';
import { ServicesComponent } from './pages/services/services.component';
import { RoomTypesComponent } from './pages/room-types/room-types.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { UserFormComponent } from './pages/users/user-form/user-form.component';
import { RoomTypeFormComponent } from './pages/room-types/room-type-form/room-type-form.component';
import { RoomFormComponent } from './pages/rooms/room-form/room-form.component';
import { ServiceFormComponent } from './pages/services/service-form/service-form.component';
import { BookingFormComponent } from './pages/bookings/booking-form/booking-form.component';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        component: DashboardLayoutComponent,
        children: [
            { path: '', component: DashboardHomeComponent },
            { path: 'users', component: UsersComponent },
            { path: 'users/new', component: UserFormComponent },
            { path: 'users/edit/:id', component: UserFormComponent },
            { path: 'services', component: ServicesComponent },
            { path: 'services/new', component: ServiceFormComponent },
            { path: 'services/edit/:id', component: ServiceFormComponent },
            { path: 'room-types', component: RoomTypesComponent },
            { path: 'room-types/new', component: RoomTypeFormComponent },
            { path: 'room-types/edit/:id', component: RoomTypeFormComponent },
            { path: 'rooms', component: RoomsComponent },
            { path: 'rooms/new', component: RoomFormComponent },
            { path: 'rooms/edit/:id', component: RoomFormComponent },
            { path: 'bookings', component: BookingsComponent },
            { path: 'bookings/new', component: BookingFormComponent },
            { path: 'bookings/edit/:id', component: BookingFormComponent },
            // TODO: Add an AuthGuard here to protect these routes
        ]
    }
]; 