import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service'; // Import AuthService
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule], // Add CommonModule
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  // Inject AuthService
  constructor(private authService: AuthService, private router: Router) {}

  // Check if the current user is an admin
  get isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  // Placeholder for logout functionality
  logout(): void {
    console.log('Logout clicked');
    this.authService.logout();
    // Navigate to login or home page - Requires Router injection if done here
    this.router.navigate(['employee/login']);
  }
}