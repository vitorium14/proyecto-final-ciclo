import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomFilterOptions, RoomResponse, RoomType, RoomTypeResponse } from '../models/room.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private baseUrl = `${environment.apiUrl}/rooms`;
  private roomTypesUrl = `${environment.apiUrl}/room-types`;

  constructor(private http: HttpClient) { }

  // Room CRUD operations
  getRooms(filters?: RoomFilterOptions): Observable<RoomResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.roomTypeId) params = params.set('roomTypeId', filters.roomTypeId.toString());
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.searchTerm) params = params.set('search', filters.searchTerm);
    }
    
    return this.http.get<RoomResponse>(this.baseUrl, { params });
  }

  getRoom(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.baseUrl}/${id}`);
  }

  createRoom(room: Partial<Room>): Observable<Room> {
    return this.http.post<Room>(this.baseUrl, room);
  }

  updateRoom(id: number, room: Partial<Room>): Observable<Room> {
    return this.http.put<Room>(`${this.baseUrl}/${id}`, room);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Room Type operations
  getRoomTypes(): Observable<RoomTypeResponse> {
    return this.http.get<RoomTypeResponse>(this.roomTypesUrl);
  }

  getRoomType(id: number): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.roomTypesUrl}/${id}`);
  }
  
  createRoomType(roomType: Partial<RoomType>): Observable<RoomType> {
    return this.http.post<RoomType>(this.roomTypesUrl, roomType);
  }

  updateRoomType(id: number, roomType: Partial<RoomType>): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.roomTypesUrl}/${id}`, roomType);
  }

  deleteRoomType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.roomTypesUrl}/${id}`);
  }
}
