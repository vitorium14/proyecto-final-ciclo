import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { Reservation, ReservationStatus } from '../../../models/reservation.model';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'app-reservation-detail',
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.css'],
  standalone: true,
  imports: [NgIf, NgClass, RouterLink, CurrencyPipe, DatePipe]
})
export class ReservationDetailComponent implements OnInit {
  reservation: Reservation | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  
  // Define reservation status options array
  reservationStatusOptions = [
    { value: 'pending', label: 'Pendiente', class: 'bg-warning' },
    { value: 'confirmed', label: 'Confirmada', class: 'bg-success' },
    { value: 'cancelled', label: 'Cancelada', class: 'bg-danger' },
    { value: 'completed', label: 'Completada', class: 'bg-info' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReservation(+id);
    } else {
      this.router.navigate(['/dashboard/reservations']);
    }
  }

  loadReservation(id: number): void {
    this.isLoading = true;
    this.reservationService.getReservation(id).subscribe({
      next: (reservation) => {
        this.reservation = reservation;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reservation', err);
        this.error = 'Error al cargar la reserva';
        this.isLoading = false;
      }
    });
  }

  deleteReservation(): void {
    if (this.reservation && confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      this.reservationService.deleteReservation(this.reservation.id).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/reservations']);
        },
        error: (err) => {
          console.error('Error deleting reservation', err);
          this.error = 'Error al eliminar la reserva';
        }
      });
    }
  }

  getReservationStatusLabel(status?: ReservationStatus): string {
    if (!status) return 'Desconocido';
    const option = this.reservationStatusOptions.find(opt => opt.value === status);
    return option ? option.label : 'Desconocido';
  }

  getReservationStatusClass(status?: ReservationStatus): string {
    if (!status) return '';
    const option = this.reservationStatusOptions.find(opt => opt.value === status);
    return option ? option.class : '';
  }
  
  getDurationDays(): number {
    if (!this.reservation) return 0;
    
    const checkIn = new Date(this.reservation.checkIn);
    const checkOut = new Date(this.reservation.checkOut);
    
    // Calcular la diferencia en milisegundos
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    
    // Convertir a días y redondear hacia arriba (una estancia parcial cuenta como día completo)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
} 