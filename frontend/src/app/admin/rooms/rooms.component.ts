import { Component, OnInit } from '@angular/core';
import { RoomService, Room } from '../../services/room.service';
import { Modal } from 'bootstrap';
import { CommonModule } from '@angular/common';
import { RoomFormComponent } from '../../shared/room-form/room-form.component';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule, RoomFormComponent],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  selectedRoom: Room | null = null;
  modal: Modal | null = null

  constructor(private roomService: RoomService) { }

  ngOnInit() {
    this.getRoomsData()
    this.modal = new Modal(document.getElementById('roomModal')!)
  }

  openModal(room: Room | null) {
    this.selectedRoom = room;
    this.modal!.show();
  }

  onSaveRoom(room: Room) {
    this.modal!.hide()
    this.roomService.createRoom(room).subscribe({
      error: error => console.error(error),
      complete: () => this.getRoomsData()
    })
  }

  getRoomsData() {
    this.roomService.getRooms().subscribe((response) => {
      this.rooms = response
    })
  }

  deleteRoom(room: Room) {
    this.roomService.deleteRoom(room).subscribe({
      error: error => console.error(error),
      complete: () => this.getRoomsData()
    })
  }
}
