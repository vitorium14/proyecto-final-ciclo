import { Component, OnInit } from '@angular/core';
import { Reservation, ReservationService } from '../../services/reservation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservations',
  imports: [CommonModule],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.css'
})
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];

  constructor(private reservationService: ReservationService) { }

  ngOnInit() {
    this.reservationService.getReservations().subscribe(data => {
      this.reservations = data;
    });
  }

  newReservation() {
    const newReservation: Reservation = {
      id: 0,
      clientName: 'Nuevo Cliente',
      roomNumber: 0,
      checkInDate: '2025-03-20',
      checkOutDate: '2025-03-25'
    };

    this.reservationService.addReservation(newReservation);
  }

  editReservation(reservation: Reservation) {
    const updatedReservation = {
      ...reservation,
      clientName: 'Cliente Editado'
    };

    this.reservationService.updateReservation(updatedReservation);
  }

  deleteReservation(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      this.reservationService.deleteReservation(id);
    }
  }
}
