import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Reservation {
  id: number;
  clientName: string;
  roomNumber: number;
  checkInDate: string;
  checkOutDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private reservations: Reservation[] = [
    { id: 1, clientName: 'Juan Pérez', roomNumber: 101, checkInDate: '2025-03-15', checkOutDate: '2025-03-20' },
    { id: 2, clientName: 'Ana García', roomNumber: 202, checkInDate: '2025-03-18', checkOutDate: '2025-03-25' }
  ];

  private reservationSubject = new BehaviorSubject<Reservation[]>(this.reservations);

  getReservations(): Observable<Reservation[]> {
    return this.reservationSubject.asObservable();
  }

  addReservation(reservation: Reservation) {
    reservation.id = this.reservations.length + 1;
    this.reservations.push(reservation);
    this.reservationSubject.next(this.reservations);
  }

  updateReservation(updatedReservation: Reservation) {
    const index = this.reservations.findIndex(r => r.id === updatedReservation.id);
    if (index > -1) {
      this.reservations[index] = updatedReservation;
      this.reservationSubject.next(this.reservations);
    }
  }

  deleteReservation(id: number) {
    this.reservations = this.reservations.filter(r => r.id !== id);
    this.reservationSubject.next(this.reservations);
  }
}