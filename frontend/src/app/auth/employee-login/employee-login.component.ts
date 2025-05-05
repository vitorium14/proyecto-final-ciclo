import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-login',
  standalone: true, // Assuming standalone based on other components
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-login.component.html',
  styleUrl: './employee-login.component.scss'
})
export class EmployeeLoginComponent {
  email = '';
  password = '';
  loading = false;
  loginError: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.loginError = null;
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        // Redirect to employee dashboard on successful login
        this.router.navigate(['/employee/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        // Consider more specific error handling/messaging for employee login if needed
        this.loginError = 'Login failed. Please check your credentials.'; // Generic error for now
        console.error('Employee Login Error:', err); // Log the actual error
      }
    });
  }
}