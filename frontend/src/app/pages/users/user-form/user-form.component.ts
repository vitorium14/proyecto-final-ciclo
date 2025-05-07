import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User, UserCreate } from '../../../models/user.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  userId: number | null = null;
  isEditing = false;
  loading = false;
  error = '';
  successMessage = '';
  roleOptions = [
    { value: 'ROLE_USER', label: 'Cliente' },
    { value: 'ROLE_EMPLOYEE', label: 'Empleado' },
    { value: 'ROLE_ADMIN', label: 'Administrador' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      surnames: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(6)],
      role: ['ROLE_USER', Validators.required]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.userId = +idParam;
      this.isEditing = true;
      this.loadUser(this.userId);
      // Eliminar validación requerida de contraseña al editar
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadUser(id: number): void {
    this.loading = true;
    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          name: user.name,
          surnames: user.surnames,
          email: user.email,
          roles: user.roles
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar el usuario';
        this.toastService.error(this.error, 'Error');
        this.loading = false;
        console.error('Error loading user', err);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      this.toastService.error('Por favor, completa todos los campos correctamente', 'Formulario inválido');
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const formValues = this.userForm.value;
    
    if (this.isEditing && this.userId) {
      // Al editar, solo enviamos los campos que tienen valor
      const updateData: Partial<User> = {
        name: formValues.name,
        surnames: formValues.surnames,
        email: formValues.email,
        roles: formValues.role
      };
      
      // Solo incluir la contraseña si se ha cambiado
      if (formValues.password) {
        updateData.password = formValues.password;
      }
      
      this.userService.updateUser(this.userId, updateData).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Usuario actualizado correctamente';
          this.toastService.success(this.successMessage);
          setTimeout(() => {
            this.router.navigate(['/dashboard/users']);
          }, 1500);
        },
        error: (err) => {
          this.error = err.message || 'Error al actualizar el usuario';
          this.toastService.error(this.error, 'Error');
          this.loading = false;
          console.error('Error updating user', err);
        }
      });
    } else {
      // Al crear, necesitamos incluir la contraseña
      const newUser: UserCreate = {
        name: formValues.name,
        surnames: formValues.surnames,
        email: formValues.email,
        password: formValues.password,
        roles: formValues.role
      };

      console.log(newUser);
      const createMethod = formValues.role === 'ROLE_USER' 
        ? this.userService.createClientUser.bind(this.userService)
        : this.userService.createPrivilegedUser.bind(this.userService);
      
      createMethod(newUser).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Usuario creado correctamente';
          this.toastService.success(this.successMessage);
          setTimeout(() => {
            this.router.navigate(['/dashboard/users']);
          }, 1500);
        },
        error: (err) => {
          this.error = err.message || 'Error al crear el usuario';
          this.toastService.error(this.error, 'Error');
          this.loading = false;
          console.error('Error creating user', err);
        }
      });
    }
  }

  // Helper para mensajes de validación
  hasError(controlName: string, errorType: string): boolean {
    const control = this.userForm.get(controlName);
    return (control?.touched || control?.dirty) 
        && control?.hasError(errorType) 
        || false;
  }
} 