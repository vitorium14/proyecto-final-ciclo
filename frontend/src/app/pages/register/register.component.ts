import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserCreationPayload } from '../../models/api.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  success = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surnames: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.mustMatch('password', 'confirmPassword')
    });
  }

  // Getter para acceder fácilmente a los campos del formulario
  get f() { return this.registerForm.controls; }

  // Validador personalizado para verificar que las contraseñas coincidan
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onSubmit(): void {
    this.submitted = true;

    // Detener si el formulario es inválido
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const userData: UserCreationPayload = {
      name: this.f['name'].value,
      surnames: this.f['surnames'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      role: 'CLIENT' // Rol por defecto para nuevos registros
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        
        // Opcional: Redirigir o mostrar mensaje de éxito
        setTimeout(() => {
          this.router.navigate(['/login'], { 
            queryParams: { registered: 'success' } 
          });
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.error = 'El email ya está registrado.';
        } else {
          this.error = 'Error al registrar. Por favor, inténtalo de nuevo.';
        }
        console.error('Error al registrar:', err);
      }
    });
  }
} 