import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { Booking, User } from '../../models/api.model';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  currentUser: User | null = null;
  bookings: Booking[] = [];
  loading = true;
  error = '';
  activeTab = 'upcoming'; // 'upcoming', 'past', 'all'

  constructor(
    private authService: AuthService,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadBookings();
  }

  loadBookings(): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.error = 'No se pudo obtener información del usuario actual';
      this.loading = false;
      return;
    }

    this.bookingService.getBookingsByUserId(this.currentUser.id).subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las reservas. Por favor, inténtalo de nuevo.';
        this.loading = false;
        console.error('Error al cargar reservas:', err);
      }
    });
  }

  // Cambiar pestaña activa
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Filtrar reservas según la pestaña activa
  getFilteredBookings(): Booking[] {
    const today = new Date();
    
    if (this.activeTab === 'upcoming') {
      return this.bookings.filter(booking => {
        const checkOut = new Date(booking.checkOut);
        return checkOut >= today;
      });
    } else if (this.activeTab === 'past') {
      return this.bookings.filter(booking => {
        const checkOut = new Date(booking.checkOut);
        return checkOut < today;
      });
    }
    
    return this.bookings; // 'all'
  }

  // Calcular la duración de la estancia en días
  getStayDuration(booking: Booking): number {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Check if booking is completed
  isCompleted(booking: Booking): boolean {
    return new Date(booking.checkOut) < new Date() && booking.checkedOut;
  }

  // Check if booking is active
  isActive(booking: Booking): boolean {
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return checkIn <= now && checkOut >= now;
  }

  // Check if booking is upcoming
  isUpcoming(booking: Booking): boolean {
    return new Date(booking.checkIn) > new Date();
  }

  // Cancelar reserva
  cancelBooking(bookingId: number): void {
    if (confirm('¿Estás seguro que deseas cancelar esta reserva?')) {
      this.bookingService.deleteBooking(bookingId).subscribe({
        next: () => {
          // Eliminar la reserva de la lista local
          this.bookings = this.bookings.filter(b => b.id !== bookingId);
        },
        error: (err) => {
          this.error = 'Error al cancelar la reserva. Por favor, inténtalo de nuevo.';
          console.error('Error al cancelar reserva:', err);
        }
      });
    }
  }
} 