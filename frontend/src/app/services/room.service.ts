import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomCreationPayload, RoomUpdatePayload } from '../models/api.model';

@Injectable({
    providedIn: 'root'
})
export class RoomService {
    private apiUrl = 'http://localhost:8000/api/rooms'; // Assuming a global proxy is configured

    constructor(private http: HttpClient) { }

    getAllRooms(): Observable<Room[]> {
        return this.http.get<Room[]>(this.apiUrl);
    }

    getRoomById(id: number): Observable<Room> {
        return this.http.get<Room>(`${this.apiUrl}/${id}`);
    }

    createRoom(payload: RoomCreationPayload): Observable<Room> {
        return this.http.post<Room>(this.apiUrl, payload);
    }

    updateRoom(id: number, payload: RoomUpdatePayload): Observable<Room> {
        return this.http.put<Room>(`${this.apiUrl}/${id}`, payload);
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

    checkRoomTypeAvailability(roomTypeId: number, startDate: string, endDate: string): Observable<any> {
        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<any>(`${this.apiUrl}/availability-by-type/${roomTypeId}`, { params });
    }
} 