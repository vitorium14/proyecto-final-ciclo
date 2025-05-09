import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomType } from '../models/api.model';
import { Image } from '../models/api.model'; // Import Image model

@Injectable({
    providedIn: 'root'
})
export class RoomTypeService {
    private apiUrl = '/api/room-types'; // Assuming a global proxy is configured

    constructor(private http: HttpClient) { }

    getAllRoomTypes(): Observable<RoomType[]> {
        return this.http.get<RoomType[]>(this.apiUrl);
    }

    getRoomTypeById(id: number): Observable<RoomType> {
        return this.http.get<RoomType>(`${this.apiUrl}/${id}`);
    }

    createRoomType(roomType: Omit<RoomType, 'id' | 'rooms' | 'images'> & { images?: Omit<Image, 'id'>[] }): Observable<RoomType> {
        return this.http.post<RoomType>(this.apiUrl, roomType);
    }

    updateRoomType(id: number, roomType: Partial<Omit<RoomType, 'id' | 'rooms' | 'images'> & { images?: Omit<Image, 'id'>[] }>): Observable<RoomType> {
        return this.http.put<RoomType>(`${this.apiUrl}/${id}`, roomType);
    }

    deleteRoomType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
} 