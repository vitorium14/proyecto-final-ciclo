import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Room {
  id: number;
  roomNumber: number;
  type: string;
  pricePerNight: number;
  isAvailable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private rooms: Room[] = [
    { id: 1, roomNumber: 101, type: 'Individual', pricePerNight: 50, isAvailable: true },
    { id: 2, roomNumber: 102, type: 'Doble', pricePerNight: 75, isAvailable: false }
  ];

  private roomSubject = new BehaviorSubject<Room[]>(this.rooms);

  getRooms(): Observable<Room[]> {
    return this.roomSubject.asObservable();
  }

  addRoom(room: Room) {
    room.id = this.rooms.length + 1;
    this.rooms.push(room);
    this.roomSubject.next(this.rooms);
  }

  updateRoom(updatedRoom: Room) {
    const index = this.rooms.findIndex(r => r.id === updatedRoom.id);
    if (index > -1) {
      this.rooms[index] = updatedRoom;
      this.roomSubject.next(this.rooms);
    }
  }

  deleteRoom(id: number) {
    this.rooms = this.rooms.filter(r => r.id !== id);
    this.roomSubject.next(this.rooms);
  }
}
