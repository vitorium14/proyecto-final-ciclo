import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgClass, NgFor, DatePipe } from '@angular/common';
import { Reservation } from '../../models/reservation.model';
import { ReservationService } from '../../services/reservation.service';
import { RoomService } from '../../services/room.service';
import { ServiceService } from '../../services/service.service';
import { Room, RoomType } from '../../models/room.model';
import { Service } from '../../models/service.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-public-reservation-form',
  templateUrl: './public-reservation-form.component.html',
  styleUrls: ['./public-reservation-form.component.css'],
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, NgClass, NgFor, DatePipe]
})
export class PublicReservationFormComponent implements OnInit {
  reservationForm: FormGroup;
  isLoading: boolean = false;
  error: string | null = null;
  rooms: Room[] = [];
  roomTypes: RoomType[] = [];
  availableServices: Service[] = [];
  isRoomReservation: boolean = true;
  roomTypeId: number | null = null;
  serviceId: number | null = null;
  minDate: string;
  success: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private roomService: RoomService,
    private serviceService: ServiceService,
    private toastService: ToastService
  ) {
    // Inicializar el formulario
    this.reservationForm = this.fb.group({
      roomTypeId: ['', this.isRoomReservation ? Validators.required : null],
      serviceId: ['', !this.isRoomReservation ? Validators.required : null],
      checkIn: ['', Validators.required],
      checkOut: ['', this.isRoomReservation ? Validators.required : null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      observations: [''],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });

    // Establecer la fecha mínima como el día de hoy
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    // Detectar si es reserva de habitación o solicitud de servicio
    this.route.url.subscribe(segments => {
      this.isRoomReservation = segments[0].path === 'reservar';
      this.updateFormValidators();
    });

    // Cargar los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      if (params['roomTypeId']) {
        this.roomTypeId = parseInt(params['roomTypeId']);
        this.reservationForm.patchValue({ roomTypeId: this.roomTypeId });
      }
      
      if (params['serviceId']) {
        this.serviceId = parseInt(params['serviceId']);
        this.reservationForm.patchValue({ serviceId: this.serviceId });
      }
    });

    this.loadRoomTypes();
    this.loadServices();
  }

  // Actualizar los validadores según el tipo de reserva
  updateFormValidators(): void {
    const roomTypeControl = this.reservationForm.get('roomTypeId');
    const serviceControl = this.reservationForm.get('serviceId');
    const checkOutControl = this.reservationForm.get('checkOut');
    const quantityControl = this.reservationForm.get('quantity');

    if (this.isRoomReservation) {
      roomTypeControl?.setValidators([Validators.required]);
      serviceControl?.clearValidators();
      checkOutControl?.setValidators([Validators.required]);
      quantityControl?.clearValidators();
    } else {
      roomTypeControl?.clearValidators();
      serviceControl?.setValidators([Validators.required]);
      checkOutControl?.clearValidators();
      quantityControl?.setValidators([Validators.required, Validators.min(1)]);
    }

    roomTypeControl?.updateValueAndValidity();
    serviceControl?.updateValueAndValidity();
    checkOutControl?.updateValueAndValidity();
    quantityControl?.updateValueAndValidity();
  }

  loadRoomTypes(): void {
    this.roomService.getRoomTypes().subscribe({
      next: (response) => {
        this.roomTypes = response.room_types || [];
      },
      error: (err) => {
        console.error('Error loading room types', err);
        this.error = 'Error al cargar las habitaciones disponibles';
        this.toastService.error(this.error, 'Error');
      }
    });
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (response) => {
        this.availableServices = response.services || [];
      },
      error: (err) => {
        console.error('Error loading services', err);
        this.error = 'Error al cargar los servicios disponibles';
        this.toastService.error(this.error, 'Error');
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
    
    // Formato diferente según sea reserva de habitación o solicitud de servicio
    if (this.isRoomReservation) {
      const reservationData = {
        roomTypeId: formValue.roomTypeId,
        checkIn: formValue.checkIn,
        checkOut: formValue.checkOut,
        name: formValue.name,
        email: formValue.email,
        phone: formValue.phone,
        observations: formValue.observations
      };

      this.reservationService.createPublicReservation(reservationData).subscribe({
        next: () => {
          this.success = true;
          this.toastService.success('Tu solicitud de reserva se ha enviado correctamente', 'Solicitud Enviada');
          this.reservationForm.reset();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error creating reservation', err);
          this.error = 'Error al crear la reserva. Por favor, inténtalo de nuevo más tarde.';
          this.toastService.error(this.error, 'Error');
          this.isLoading = false;
        }
      });
    } else {
      const serviceRequestData = {
        serviceId: formValue.serviceId,
        quantity: formValue.quantity,
        requestDate: formValue.checkIn,
        name: formValue.name,
        email: formValue.email,
        phone: formValue.phone,
        observations: formValue.observations
      };

      this.serviceService.requestService(serviceRequestData).subscribe({
        next: () => {
          this.success = true;
          this.toastService.success('Tu solicitud de servicio se ha enviado correctamente', 'Solicitud Enviada');
          this.reservationForm.reset();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error requesting service', err);
          this.error = 'Error al solicitar el servicio. Por favor, inténtalo de nuevo más tarde.';
          this.toastService.error(this.error, 'Error');
          this.isLoading = false;
        }
      });
    }
  }
} 