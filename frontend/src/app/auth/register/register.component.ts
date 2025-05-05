import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  fullname = '';
  email = '';
  password = '';
  phone = '';
  dni = '';
  loading = false;
  registerError: string | null = null;
  registerSuccess: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    this.registerError = null;
    this.registerSuccess = null;
    this.loading = true;
    this.auth.register(this.email, this.password, this.fullname, this.phone, this.dni).subscribe({
      next: (response) => { // Assuming the backend might return a message
        this.loading = false;
        this.registerSuccess = '¡Registro completado! Serás redirigido al login.'; // Set success message
        console.log('Registration successful:', response);
        // Navigate after a short delay to show the message
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000); // 2-second delay
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration Error:', err); // Log the actual error
        // Provide a user-friendly error message
        this.registerError = 'El registro ha fallado. Por favor, revisa los datos e inténtalo de nuevo.';
        if (err?.error?.message) { // Check if backend provides a specific message
          this.registerError = err.error.message;
        }
      }
    });
  }
}
