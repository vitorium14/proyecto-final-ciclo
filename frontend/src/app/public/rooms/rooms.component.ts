import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { ReservationService } from '../../services/reservation.service';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-rooms',
  standalone: true, // Ensure standalone is true
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule // Add ReactiveFormsModule
  ],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'] // Corrected property name
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  uniqueRoomTypes: string[] = []; // To populate the dropdown
  reservationForm!: FormGroup; // Use definite assignment assertion or initialize in constructor/ngOnInit
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private roomService: RoomService,
    private reservationService: ReservationService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.initForm();
  }

  // Placeholder for custom validator - password match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    // Check if controls exist and haven't been interacted with initially
    if (!password || !confirmPassword || !password.value || !confirmPassword.value) {
      return null;
    }
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Placeholder for custom validator - date range
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const checkIn = control.get('checkIn');
    const checkOut = control.get('checkOut');
    if (!checkIn || !checkOut || !checkIn.value || !checkOut.value) {
      return null;
    }
    const checkInDate = new Date(checkIn.value);
    const checkOutDate = new Date(checkOut.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only

    if (checkInDate < today) {
       return { checkInPast: true };
    }
    return checkOutDate > checkInDate ? null : { dateRangeInvalid: true };
  }


  initForm(): void {
    this.reservationForm = this.fb.group({
      checkIn: ['', [Validators.required]],
      checkOut: ['', [Validators.required]],
      roomType: ['', [Validators.required]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: [this.passwordMatchValidator, this.dateRangeValidator] }); // Add group validators
  }

  loadRooms(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        // Extract unique room types for the dropdown
        this.uniqueRoomTypes = [...new Set(rooms.map(room => room.type))].sort();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading rooms:', err);
        this.errorMessage = 'Error al cargar las habitaciones. Por favor, inténtelo de nuevo más tarde.';
        this.isLoading = false;
      }
    });
  }

  // Helper method to get the first room matching a type
  getRoomExample(type: string): Room | undefined {
    return this.rooms.find(room => room.type === type);
  }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.reservationForm.markAllAsTouched(); // Mark all fields for validation feedback

    // Clear specific errors before re-validating
    this.reservationForm.get('confirmPassword')?.setErrors(null);
    this.reservationForm.updateValueAndValidity(); // Re-run group validators

    if (this.reservationForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos correctamente.';
      // Find specific errors
      if (this.reservationForm.hasError('passwordMismatch')) {
        this.errorMessage = 'Las contraseñas no coinciden.';
        this.reservationForm.get('confirmPassword')?.setErrors({'passwordMismatch': true});
      } else if (this.reservationForm.hasError('dateRangeInvalid')) {
         this.errorMessage = 'La fecha de salida debe ser posterior a la fecha de entrada.';
      } else if (this.reservationForm.hasError('checkInPast')) {
         this.errorMessage = 'La fecha de entrada no puede ser en el pasado.';
      }
      return;
    }

    this.isLoading = true;
    const formData = this.reservationForm.value;

    // We don't need confirmPassword in the backend request
    const { confirmPassword, ...payload } = formData;

    this.reservationService.createPublicReservation(payload).subscribe({
      next: (response) => {
        this.successMessage = `¡Reserva creada con éxito! ${response.newUserCreated ? 'Tu cuenta también ha sido creada.' : ''} ID Reserva: ${response.reservationId}`;
        this.isLoading = false;
        this.reservationForm.reset();
        // Optionally navigate or clear form
        // this.router.navigate(['/reservation-success']); // Example navigation
      },
      error: (err) => {
        console.error('Error creating reservation:', err);
        if (err.status === 409) { // Conflict (e.g., room unavailable)
          this.errorMessage = err.error?.error || 'No hay habitaciones disponibles de este tipo para las fechas seleccionadas.';
        } else if (err.status === 400) { // Bad Request (validation errors from backend)
          this.errorMessage = err.error?.error || 'Datos inválidos. Por favor, revise el formulario.';
        } else {
          this.errorMessage = 'Ocurrió un error al crear la reserva. Por favor, inténtelo de nuevo.';
        }
        this.isLoading = false;
      }
    });
  }
}
