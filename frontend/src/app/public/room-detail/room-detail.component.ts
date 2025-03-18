import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Room, RoomService } from '../../services/room.service';
import { CommonModule } from '@angular/common';
import { BookingFormComponent } from '../booking-form/booking-form.component';

@Component({
  selector: 'app-room-detail',
  imports: [CommonModule, BookingFormComponent],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.css',
})
export class RoomDetailComponent implements OnInit {
  room!: Room;

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private router: Router,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.roomService.getRooms().subscribe((rooms) => {
      this.room = rooms.find((r) => r.id === id)!;
    });
  }

  reserveRoom() {
    alert(`Habitación Nº ${this.room.number} reservada correctamente.`);
    this.router.navigate(['/rooms']);
  }
}
