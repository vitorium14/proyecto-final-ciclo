import { Routes } from '@angular/router';
import { HomeComponent } from './public/home/home.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { ContactComponent } from './public/contact/contact.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'auth/login', component: LoginComponent },
      { path: 'auth/register', component: RegisterComponent },
      // Ejemplo de ruta privada protegida:
      // { path: 'reservas', component: ReservasComponent, canActivate: [AuthGuard] }
    ]
  }
];
