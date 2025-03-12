import { Component, OnInit } from '@angular/core';
import { RoomService, Room } from '../../services/room.service';
import { Modal } from 'bootstrap';
import { CommonModule } from '@angular/common';
import { RoomFormComponent } from '../../shared/room-form/room-form.component';

@Component({
  selector: 'app-rooms',
  imports:[CommonModule, RoomFormComponent],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  selectedRoom: Room | null = null;
  modal: any;

  constructor(private roomService: RoomService) {}

  ngOnInit() {
    this.roomService.getRooms().subscribe(data => {
      this.rooms = data;
    });
  }

  openModal(room: Room | null) {
    this.selectedRoom = room;
    this.modal = new Modal(document.getElementById('roomModal')!);
    this.modal.show();
  }

  onSaveRoom(room: Room) {
    if (room.id) {
      this.roomService.updateRoom(room);
    } else {
      this.roomService.addRoom(room);
    }
    this.modal.hide();
  }

  deleteRoom(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta habitación?')) {
      this.roomService.deleteRoom(id);
    }
  }
}