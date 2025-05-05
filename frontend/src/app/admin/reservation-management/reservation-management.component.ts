import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service'; // Import ReservationService
// import { Reservation } from '../../models/reservation.model'; // Import Reservation model later

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-management.component.html',
  styleUrl: './reservation-management.component.scss'
})
export class ReservationManagementComponent implements OnInit {
  reservations: any[] = []; // Replace 'any' with Reservation model later
  isLoading = false;
  error: string | null = null;

  // Inject ReservationService
  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.error = null;
    // Call the service to get all reservations
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load reservations.';
        console.error('Error loading reservations:', err);
        this.isLoading = false;
      }
    });
  }

  // Add methods for editReservation, deleteReservation, createReservation later
}