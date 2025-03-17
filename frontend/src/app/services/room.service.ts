import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api_response.interface'

export interface Room {
  id: number;
  number: number;
  type: string;
  price: number;
  status: string;
  capacity: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private url = 'http://localhost:8000/room'

  constructor(private http: HttpClient) { }

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.url)
  }
  createRoom(room: Room): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.url, room)
  }

  updateRoom(room: Room) {

  }

  deleteRoom(room: Room): Observable<ApiResponse> {
    let modifiedUrl = this.url + '/' + room.id
    return this.http.delete<ApiResponse>(modifiedUrl)
  }
}
