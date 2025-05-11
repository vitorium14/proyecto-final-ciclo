import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RoomTypeService } from '../../services/room-type.service';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';
import { ServiceService } from '../../services/service.service';
import { AuthService } from '../../services/auth.service';
import { Booking, BookingCreationPayload, Room, RoomType, Service, User } from '../../models/api.model';

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.css']
})
export class CreateBookingComponent implements OnInit {
  bookingForm!: FormGroup;
  roomTypeId!: number;
  roomType: RoomType | null = null;
  availableRooms: Room[] = [];
  services: Service[] = [];
  currentUser: User | null = null;
  loading = false;
  roomsLoading = false;
  submitted = false;
  error = '';
  success = false;
  minDate = new Date();
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roomTypeService: RoomTypeService,
    private roomService: RoomService,
    private bookingService: BookingService,
    private serviceService: ServiceService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.roomTypeId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.roomTypeId)) {
      this.error = 'ID de tipo de habitación no válido';
      return;
    }

    this.loadRoomType();
    this.loadServices();

    // Inicializar formulario
    this.bookingForm = this.formBuilder.group({
      checkIn: ['', [Validators.required]],
      checkOut: ['', [Validators.required]],
      room: ['', [Validators.required]],
      services: [[]], // Array de IDs de servicios opcionales
      // Campos ocultos/calculados
      price: [0],
      duration: [0]
    });

    // Escuchar cambios en las fechas para actualizar habitaciones disponibles
    this.bookingForm.get('checkIn')?.valueChanges.subscribe(() => this.updateAvailableRooms());
    this.bookingForm.get('checkOut')?.valueChanges.subscribe(() => this.updateAvailableRooms());
  }

  // Cargar el tipo de habitación seleccionado
  loadRoomType(): void {
    this.loading = true;
    this.roomTypeService.getRoomTypeById(this.roomTypeId).subscribe({
      next: (data) => {
        this.roomType = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el tipo de habitación: ' + err.message;
        this.loading = false;
      }
    });
  }

  // Cargar servicios disponibles
  loadServices(): void {
    this.serviceService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        // No mostramos error para no interrumpir el flujo
      }
    });
  }

  // Actualizar habitaciones disponibles según fechas seleccionadas
  updateAvailableRooms(): void {
    const checkIn = this.bookingForm.get('checkIn')?.value;
    const checkOut = this.bookingForm.get('checkOut')?.value;

    if (!checkIn || !checkOut) {
      return;
    }

    this.roomsLoading = true;
    this.roomService.getAvailableRooms(checkIn, checkOut).subscribe({
      next: (rooms) => {
        // Filtrar sólo las habitaciones del tipo seleccionado
        this.availableRooms = rooms.filter(room => room.type.id === this.roomTypeId);
        this.roomsLoading = false;
        
        // Actualizar precio y duración
        this.updatePriceAndDuration();
      },
      error: (err) => {
        this.error = 'Error al cargar habitaciones disponibles: ' + err.message;
        this.roomsLoading = false;
      }
    });
  }

  // Calcular precio total y duración de la estancia
  updatePriceAndDuration(): void {
    const checkIn = new Date(this.bookingForm.get('checkIn')?.value);
    const checkOut = new Date(this.bookingForm.get('checkOut')?.value);

    if (!checkIn || !checkOut || !this.roomType) {
      return;
    }

    // Calcular duración en días
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calcular precio base (precio por noche * número de noches)
    let totalPrice = parseFloat(this.roomType.price) * diffDays;
    
    // Añadir precio de servicios seleccionados
    const selectedServices = this.bookingForm.get('services')?.value || [];
    if (selectedServices.length > 0) {
      this.services.forEach(service => {
        if (selectedServices.includes(service.id)) {
          totalPrice += parseFloat(service.price);
        }
      });
    }

    // Actualizar campos calculados
    this.bookingForm.patchValue({
      price: totalPrice.toFixed(2),
      duration: diffDays
    });
  }

  // Gestionar cambios en la selección de servicios
  onServiceChange(serviceId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const selectedServices = this.bookingForm.get('services')?.value || [];
    
    if (isChecked) {
      selectedServices.push(serviceId);
    } else {
      const index = selectedServices.indexOf(serviceId);
      if (index > -1) {
        selectedServices.splice(index, 1);
      }
    }
    
    this.bookingForm.patchValue({ services: selectedServices });
    this.updatePriceAndDuration();
  }

  // Enviar formulario de reserva
  onSubmit(): void {
    this.submitted = true;

    // Detener si el formulario es inválido
    if (this.bookingForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    // Crear payload para la API
    const bookingData: BookingCreationPayload = {
      user: this.currentUser!.id,
      room: Number(this.bookingForm.get('room')?.value),
      services: this.bookingForm.get('services')?.value || [],
      checkIn: this.formatDate(this.bookingForm.get('checkIn')?.value),
      checkOut: this.formatDate(this.bookingForm.get('checkOut')?.value),
      duration: this.bookingForm.get('duration')?.value,
      checkedIn: false,
      checkedOut: false
    };

    // Enviar solicitud a la API
    this.bookingService.createBooking(bookingData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        
        // Redirigir a la página de mis reservas
        setTimeout(() => {
          this.router.navigate(['/my-bookings']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al crear la reserva. Por favor, inténtalo de nuevo.';
        console.error('Error al crear reserva:', err);
      }
    });
  }

  // Función auxiliar para formatear fechas al formato requerido por la API
  private formatDate(date: string): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} 12:00:00`;
  }
} 