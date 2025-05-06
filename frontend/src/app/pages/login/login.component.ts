import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        if (this.authService.isEmployee()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error en el inicio de sesión';
      }
    });
  }
}
