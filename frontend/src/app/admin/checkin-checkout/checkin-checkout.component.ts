import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/reservation.model'; // Assuming Reservation model includes all necessary fields

@Component({
  selector: 'app-checkin-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkin-checkout.component.html',
  styleUrl: './checkin-checkout.component.scss'
})
export class CheckinCheckoutComponent implements OnInit {
  reservations: Reservation[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // For filtering - can be expanded later
  // For now, we'll fetch all and let the admin visually scan
  // Or implement a simple date filter if needed quickly

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadAllReservations();
  }

  loadAllReservations(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        // Sort by check-in date, most recent first for relevance
        this.reservations = data.sort((a, b) => {
          const dateA = a.checkIn ? new Date(a.checkIn).getTime() : 0;
          const dateB = b.checkIn ? new Date(b.checkIn).getTime() : 0;
          return dateB - dateA; // Descending for recent
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reservations:', err);
        this.errorMessage = err.message || 'Error al cargar las reservas.';
        this.isLoading = false;
      }
    });
  }

  handleCheckIn(reservationId: number | undefined): void {
    if (reservationId === undefined) {
      this.errorMessage = 'ID de reserva no válido para check-in.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.reservationService.checkInReservation(reservationId).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        // Update the specific reservation in the list or reload all
        const index = this.reservations.findIndex(r => r.id === reservationId);
        if (index !== -1 && response.status && response.checkedInAt) {
          this.reservations[index].status = response.status;
          this.reservations[index].checkedInAt = new Date(response.checkedInAt); // Ensure it's a Date object
        } else {
          this.loadAllReservations(); // Fallback to reload if specific update is tricky
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error during check-in:', err);
        this.errorMessage = err.message || 'Error al realizar el check-in.';
        this.isLoading = false;
      }
    });
  }

  handleCheckOut(reservationId: number | undefined): void {
    if (reservationId === undefined) {
      this.errorMessage = 'ID de reserva no válido para check-out.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.reservationService.checkOutReservation(reservationId).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        // Update the specific reservation in the list or reload all
        const index = this.reservations.findIndex(r => r.id === reservationId);
        if (index !== -1 && response.status && response.checkedOutAt) {
          this.reservations[index].status = response.status;
          this.reservations[index].checkedOutAt = new Date(response.checkedOutAt); // Ensure it's a Date object
        } else {
          this.loadAllReservations(); // Fallback
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error during check-out:', err);
        this.errorMessage = err.message || 'Error al realizar el check-out.';
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'bg-secondary';
    switch (status.toLowerCase()) {
      case 'confirmada': return 'bg-success';
      case 'pendiente': return 'bg-warning text-dark';
      case 'cancelada': return 'bg-danger';
      case 'checked-in': return 'bg-info text-dark';
      case 'checked-out': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }
}
