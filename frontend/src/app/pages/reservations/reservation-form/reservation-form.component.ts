import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { Reservation, ReservationStatus } from '../../../models/reservation.model';
import { ReservationService } from '../../../services/reservation.service';
import { RoomService } from '../../../services/room.service';
import { ServiceService } from '../../../services/service.service';
import { Room, RoomType } from '../../../models/room.model';
import { Service } from '../../../models/service.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css'],
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, NgClass, NgFor]
})
export class ReservationFormComponent implements OnInit {
  reservationForm: FormGroup;
  isEditMode: boolean = false;
  reservationId: number | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  rooms: Room[] = [];
  roomTypes: RoomType[] = [];
  availableServices: Service[] = [];
  
  // Define reservation status options array
  reservationStatusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'completed', label: 'Completada' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private roomService: RoomService,
    private serviceService: ServiceService,
    private toastService: ToastService
  ) {
    this.reservationForm = this.fb.group({
      roomId: ['', Validators.required],
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      observations: [''],
      services: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadRooms();
    this.loadRoomTypes();
    this.loadServices();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.reservationId = +id;
      this.loadReservation(this.reservationId);
    }
  }

  get servicesFormArray(): FormArray {
    return this.reservationForm.get('services') as FormArray;
  }

  addService(): void {
    this.servicesFormArray.push(
      this.fb.group({
        id: ['', Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]]
      })
    );
  }

  removeService(index: number): void {
    this.servicesFormArray.removeAt(index);
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (response) => {
        this.rooms = response.rooms;
      },
      error: (err) => {
        console.error('Error fetching rooms', err);
        this.error = 'Error al cargar las habitaciones';
        this.toastService.error(this.error);
      }
    });
  }

  loadRoomTypes(): void {
    this.roomService.getRoomTypes().subscribe({
      next: (response) => {
        this.roomTypes = response.room_types;
      },
      error: (err) => {
        console.error('Error fetching room types', err);
        this.error = 'Error al cargar los tipos de habitación';
        this.toastService.error(this.error);
      }
    });
  }

  loadServices(): void {
    this.serviceService.getServices({ active: true }).subscribe({
      next: (response) => {
        this.availableServices = response.services;
      },
      error: (err) => {
        console.error('Error fetching services', err);
        this.error = 'Error al cargar los servicios';
        this.toastService.error(this.error);
      }
    });
  }

  loadReservation(id: number): void {
    this.isLoading = true;
    this.reservationService.getReservation(id).subscribe({
      next: (reservation) => {
        // Clear existing services form array
        while (this.servicesFormArray.length) {
          this.servicesFormArray.removeAt(0);
        }
        
        // Populate form with reservation data
        this.reservationForm.patchValue({
          roomId: reservation.room.id,
          checkIn: reservation.checkIn.split('T')[0], // Format date for input
          checkOut: reservation.checkOut.split('T')[0], // Format date for input
          observations: reservation.observations || ''
        });
        
        // Add services if any
        if (reservation.services && reservation.services.length > 0) {
          reservation.services.forEach(service => {
            this.servicesFormArray.push(
              this.fb.group({
                id: [service.service.id, Validators.required],
                quantity: [service.quantity, [Validators.required, Validators.min(1)]]
              })
            );
          });
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reservation', err);
        this.error = 'Error al cargar la reserva';
        this.toastService.error(this.error, 'Error');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.reservationForm.invalid) {
      Object.keys(this.reservationForm.controls).forEach(key => {
        const control = this.reservationForm.get(key);
        if (control) control.markAsTouched();
      });
      this.toastService.error('Por favor, completa todos los campos correctamente', 'Formulario inválido');
      return;
    }

    this.isLoading = true;
    const formValue = this.reservationForm.value;
    
    // Format the payload according to API expectations
    const reservationData = {
      roomId: formValue.roomId,
      checkIn: formValue.checkIn,
      checkOut: formValue.checkOut,
      observations: formValue.observations,
      services: formValue.services.length > 0 ? formValue.services : null
    };

    if (this.isEditMode && this.reservationId) {
      this.reservationService.updateReservation(this.reservationId, reservationData).subscribe({
        next: () => {
          this.toastService.success('Reserva actualizada correctamente', 'Éxito');
          this.router.navigate(['/dashboard/reservations']);
        },
        error: (err) => {
          console.error('Error updating reservation', err);
          this.error = 'Error al actualizar la reserva';
          this.toastService.error(this.error, 'Error');
          this.isLoading = false;
        }
      });
    } else {
      this.reservationService.createReservation(reservationData).subscribe({
        next: () => {
          this.toastService.success('Reserva creada correctamente', 'Éxito');
          this.router.navigate(['/dashboard/reservations']);
        },
        error: (err) => {
          console.error('Error creating reservation', err);
          this.error = 'Error al crear la reserva';
          this.toastService.error(this.error, 'Error');
          this.isLoading = false;
        }
      });
    }
  }

  getReservationStatusLabel(status: ReservationStatus): string {
    const option = this.reservationStatusOptions.find(opt => opt.value === status);
    return option ? option.label : 'Desconocido';
  }
} 