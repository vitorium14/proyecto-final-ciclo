import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User, UserUpdatePayload } from '../../models/api.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: User | null = null;
  loading = false;
  submitting = false;
  success = false;
  error = '';
  passwordError = '';
  passwordSuccess = false;
  activeTab = 'profile'; // 'profile' o 'password'

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Inicializar formulario de perfil
    this.profileForm = this.formBuilder.group({
      name: [this.currentUser?.name || '', [Validators.required, Validators.minLength(2)]],
      surnames: [this.currentUser?.surnames || '', [Validators.required, Validators.minLength(2)]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]]
    });
    
    // Inicializar formulario de contraseña
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.mustMatch('newPassword', 'confirmPassword')
    });
  }

  // Getters para acceder fácilmente a los campos del formulario
  get pf() { return this.profileForm.controls; }
  get pwf() { return this.passwordForm.controls; }

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

  // Cambiar pestaña activa
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.success = false;
    this.error = '';
    this.passwordSuccess = false;
    this.passwordError = '';
  }

  // Guardar cambios de perfil
  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.submitting = true;
    this.error = '';
    this.success = false;
    
    if (!this.currentUser || !this.currentUser.id) {
      this.error = 'No se pudo obtener información del usuario actual';
      this.submitting = false;
      return;
    }

    const userData: UserUpdatePayload = {
      name: this.pf['name'].value,
      surnames: this.pf['surnames'].value,
      email: this.pf['email'].value
    };

    this.userService.updateUser(this.currentUser.id, userData).subscribe({
      next: (response) => {
        this.submitting = false;
        this.success = true;
        
        // Actualizar información del usuario en localStorage
        const updatedUser = {
          ...this.currentUser,
          name: userData.name,
          surnames: userData.surnames,
          email: userData.email
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUser = updatedUser as User;
      },
      error: (err) => {
        this.submitting = false;
        this.error = 'Error al actualizar el perfil. Por favor, inténtalo de nuevo.';
        console.error('Error al actualizar el perfil:', err);
      }
    });
  }

  // Cambiar contraseña
  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.submitting = true;
    this.passwordError = '';
    this.passwordSuccess = false;
    
    if (!this.currentUser || !this.currentUser.id) {
      this.passwordError = 'No se pudo obtener información del usuario actual';
      this.submitting = false;
      return;
    }

    // Aquí iría la lógica para cambiar la contraseña
    // Normalmente necesitarías un endpoint específico para esto
    const passwordData = {
      currentPassword: this.pwf['currentPassword'].value,
      newPassword: this.pwf['newPassword'].value
    };

    // Simulamos la operación por ahora
    setTimeout(() => {
      this.submitting = false;
      this.passwordSuccess = true;
      this.passwordForm.reset();
    }, 1000);

    // Implementación real sería algo como:
    /*
    this.userService.changePassword(this.currentUser.id, passwordData).subscribe({
      next: (response) => {
        this.submitting = false;
        this.passwordSuccess = true;
        this.passwordForm.reset();
      },
      error: (err) => {
        this.submitting = false;
        this.passwordError = 'Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.';
        console.error('Error al cambiar la contraseña:', err);
      }
    });
    */
  }
} 