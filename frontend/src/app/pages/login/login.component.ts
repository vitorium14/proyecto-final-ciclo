import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  returnUrl: string = '/';
  additionalParams: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  ngOnInit() {
    // Capturar la URL de retorno y parámetros adicionales si existen
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }

      // Guardar cualquier otro parámetro para pasarlo a la URL de redirección
      Object.keys(params).forEach(key => {
        if (key !== 'returnUrl') {
          this.additionalParams[key] = params[key];
        }
      });
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
        
        // Si el usuario es empleado, siempre redireccionar al dashboard
        if (this.authService.isEmployee()) {
          this.router.navigate(['/dashboard']);
        } else {
          // Si hay una URL de retorno, redireccionar con los parámetros adicionales si existen
          if (this.returnUrl !== '/') {
            this.router.navigate([this.returnUrl], { 
              queryParams: this.additionalParams 
            });
          } else {
            this.router.navigate(['/']);
          }
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error en el inicio de sesión';
        this.toastService.error(this.errorMessage!, 'Error de autenticación');
      }
    });
  }
}
