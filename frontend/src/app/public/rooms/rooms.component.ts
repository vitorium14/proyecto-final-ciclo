import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Room, RoomService } from '../../services/room.service';

@Component({
  selector: 'app-public-rooms',
  imports: [CommonModule, RouterModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsPublicComponent implements OnInit {
  rooms: Room[] = [];

  constructor(private roomService: RoomService, private router: Router) {}

  ngOnInit() {
    this.roomService.getRooms().subscribe(data => {
      this.rooms = data;
    });
  }

  viewRoom(id: number) {
    this.router.navigate(['/room', id]);
  }
}
