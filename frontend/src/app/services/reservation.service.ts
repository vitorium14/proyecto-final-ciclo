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
  providedIn: 'root',
})
export class ReservationService {}
