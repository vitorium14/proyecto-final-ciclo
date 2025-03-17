import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoomService, Room } from '../../services/room.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-form',
  imports:[ReactiveFormsModule, CommonModule],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  @Input() room!: Room;

  bookingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private router: Router
  ) { }

  ngOnInit() {
    this.bookingForm = this.fb.group({
      clientName: ['', Validators.required],
      clientEmail: ['', [Validators.required, Validators.email]],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      if (new Date(this.bookingForm.value.checkInDate) >= new Date(this.bookingForm.value.checkOutDate)) {
        alert('La fecha de check-out debe ser posterior a la de check-in');
        return;
      }

      if (!this.room.status) {
        alert('La habitación no está disponible');
        return;
      }

      alert(`Reserva confirmada para ${this.bookingForm.value.clientName}.`);

      // Actualizar disponibilidad de la habitación
      this.room.status = 'reserved';
      this.roomService.updateRoom(this.room);

      // Redirigir a la lista de habitaciones
      this.router.navigate(['/rooms']);
    }
  }
}