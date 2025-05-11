import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/api.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  currentUser: User | null = null;
  private authSubscription: Subscription | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        if (isAuthenticated) {
          this.currentUser = this.authService.getCurrentUser();
        } else {
          this.currentUser = null;
        }
      }
    );
  }

  ngOnDestroy(): void {
    // Limpieza de la suscripción
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  // Comprueba si el usuario tiene un rol específico
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  // Comprueba si el usuario tiene rol de empleado o admin
  isStaff(): boolean {
    return this.hasRole('EMPLOYEE') || this.hasRole('ADMIN');
  }
}
