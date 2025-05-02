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
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        this.registerError = err;
      }
    });
  }
}
