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
  }

  newReservation() {
  }

  editReservation(reservation: Reservation) {
  }

  deleteReservation(id: number) {
  }
}
