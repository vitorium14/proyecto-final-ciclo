import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { ServicesComponent } from './pages/services/services.component';
import { ContactComponent } from './pages/contact/contact.component';
import { CreateBookingComponent } from './pages/create-booking/create-booking.component';
import { BookingDetailComponent } from './pages/booking-detail/booking-detail.component';
import { TermsComponent } from './pages/terms/terms.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';

export const routes: Routes = [
    {
        path: '', component: MainLayoutComponent, children: [
            { path: '', component: HomeComponent },
            { path: 'rooms', component: RoomsComponent },
            { path: 'services', component: ServicesComponent },
            { path: 'contact', component: ContactComponent },
            { path: 'terms', component: TermsComponent },
            { path: 'privacy', component: PrivacyComponent },
            { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
            { path: 'my-bookings', component: MyBookingsComponent, canActivate: [authGuard] },
            { path: 'create-booking/:id', component: CreateBookingComponent, canActivate: [authGuard] },
            { path: 'booking/:id', component: BookingDetailComponent, canActivate: [authGuard] },
        ]
    },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        canActivate: [authGuard]
    },
    { path: '**', redirectTo: '' }, // Wildcard route should be last
];
