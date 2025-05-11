import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { ServiceService } from '../../services/service.service';
import { AuthService } from '../../services/auth.service';
import { Booking, Service as ApiService, User, BookingUpdatePayload } from '../../models/api.model';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.css']
})
export class BookingDetailComponent implements OnInit {
  booking: Booking | null = null;
  currentUser: User | null = null;
  loading = true;
  error = '';
  availableServices: ApiService[] = [];
  selectedServices: number[] = [];
  success = '';
  addingServices = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
    
    const bookingId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(bookingId)) {
      this.error = 'ID de reserva no válido';
      this.loading = false;
      return;
    }
    
    this.loadBookingDetails(bookingId);
    this.loadAvailableServices();
  }

  loadBookingDetails(id: number): void {
    this.loading = true;
    this.bookingService.getBookingById(id).subscribe({
      next: (data) => {
        this.booking = data;
        // Pre-seleccionar los servicios ya contratados
        this.selectedServices = data.services.map(service => service.id);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los detalles de la reserva';
        this.loading = false;
        console.error('Error al cargar detalles de la reserva:', err);
      }
    });
  }

  loadAvailableServices(): void {
    this.serviceService.getAllServices().subscribe({
      next: (data) => {
        this.availableServices = data;
      },
      error: (err) => {
        console.error('Error al cargar servicios disponibles:', err);
      }
    });
  }

  // Comprobar si la reserva está activa o es futura
  isBookingActiveOrUpcoming(): boolean {
    if (!this.booking) return false;
    const now = new Date();
    const checkOut = new Date(this.booking.checkOut);
    return checkOut >= now;
  }

  // Calcular duración de la estancia en días
  getStayDuration(): number {
    if (!this.booking) return 0;
    const checkIn = new Date(this.booking.checkIn);
    const checkOut = new Date(this.booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Manejar cambios en la selección de servicios
  toggleService(serviceId: number): void {
    const index = this.selectedServices.indexOf(serviceId);
    if (index === -1) {
      this.selectedServices.push(serviceId);
    } else {
      this.selectedServices.splice(index, 1);
    }
  }

  // Verificar si un servicio está seleccionado
  isServiceSelected(serviceId: number): boolean {
    return this.selectedServices.includes(serviceId);
  }
  
  // Actualizar servicios de la reserva
  updateBookingServices(): void {
    if (!this.booking) return;
    
    this.addingServices = true;
    
    // Calcular el precio actualizado
    let newPrice = 0;
    const roomPrice = this.booking.room.type.price;
    const duration = this.getStayDuration();
    
    // Precio base por la habitación
    newPrice += parseFloat(roomPrice) * duration;
    
    // Añadir precio de los servicios seleccionados
    this.selectedServices.forEach(serviceId => {
      const service = this.availableServices.find(s => s.id === serviceId);
      if (service) {
        newPrice += parseFloat(service.price);
      }
    });
    
    const updatePayload: BookingUpdatePayload = {
      user: this.booking.user.id,
      services: this.selectedServices,
      checkIn: this.booking.checkIn,
      checkOut: this.booking.checkOut,
      room: this.booking.room.id,
      duration: duration,
      checkedIn: this.booking.checkedIn,
      checkedOut: this.booking.checkedOut
    };
    
    this.bookingService.updateBooking(this.booking.id, updatePayload).subscribe({
      next: (updatedBooking) => {
        this.booking = updatedBooking;
        this.success = 'Servicios actualizados correctamente';
        this.addingServices = false;
        
        // Ocultar mensaje de éxito después de unos segundos
        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Error al actualizar los servicios. Por favor, inténtalo de nuevo.';
        this.addingServices = false;
        console.error('Error al actualizar servicios:', err);
      }
    });
  }
  
  // Cancelar reserva
  cancelBooking(): void {
    if (!this.booking) return;
    
    if (confirm('¿Estás seguro que deseas cancelar esta reserva? Esta acción no se puede deshacer.')) {
      this.loading = true;
      this.bookingService.deleteBooking(this.booking.id).subscribe({
        next: () => {
          this.router.navigate(['/my-bookings']);
        },
        error: (err) => {
          this.error = 'Error al cancelar la reserva. Por favor, inténtalo de nuevo.';
          this.loading = false;
          console.error('Error al cancelar reserva:', err);
        }
      });
    }
  }
}
