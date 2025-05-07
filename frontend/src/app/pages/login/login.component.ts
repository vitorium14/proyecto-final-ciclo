import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';
import { NgIf, NgClass } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgIf, NgClass],
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
    private router: Router,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.toastService.error('Por favor, completa todos los campos correctamente');
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
        this.toastService.success('Inicio de sesión exitoso', 'Bienvenido');
        if (this.authService.isEmployee()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error en el inicio de sesión';
        this.toastService.error(this.errorMessage!, 'Error de autenticación');
      }
    });
  }
}
