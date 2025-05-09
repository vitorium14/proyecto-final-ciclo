import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/api.model';

@Injectable({
    providedIn: 'root'
})
export class RoomService {
    private apiUrl = '/api/rooms'; // Assuming a global proxy is configured

    constructor(private http: HttpClient) { }

    getAllRooms(): Observable<Room[]> {
        return this.http.get<Room[]>(this.apiUrl);
    }

    getRoomById(id: number): Observable<Room> {
        return this.http.get<Room>(`${this.apiUrl}/${id}`);
    }

    createRoom(room: Omit<Room, 'id' | 'bookings' | 'type'> & { type: number }): Observable<Room> {
        return this.http.post<Room>(this.apiUrl, room);
    }

    updateRoom(id: number, room: Partial<Omit<Room, 'id' | 'bookings' | 'type'> & { type: number }>): Observable<Room> {
        return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
    }

    deleteRoom(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getAvailableRooms(startDate: string, endDate: string): Observable<Room[]> {
        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<Room[]>(`${this.apiUrl}/available`, { params });
    }
} 