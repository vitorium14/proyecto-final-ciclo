import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    RoomType,
    RoomTypeCreationPayload,
    RoomTypeUpdatePayload
} from '../models/api.model';
import { environment } from '../../environments/environment.prod';
@Injectable({
    providedIn: 'root'
})
export class RoomTypeService {
    private apiUrl = environment.apiUrl + '/room-types'; // Assuming a global proxy is configured

    constructor(private http: HttpClient) { }

    getAllRoomTypes(): Observable<RoomType[]> {
        return this.http.get<RoomType[]>(this.apiUrl);
    }

    getRoomTypeById(id: number): Observable<RoomType> {
        return this.http.get<RoomType>(`${this.apiUrl}/${id}`);
    }

    createRoomType(payload: RoomTypeCreationPayload): Observable<RoomType> {
        return this.http.post<RoomType>(this.apiUrl, payload);
    }

    updateRoomType(id: number, payload: RoomTypeUpdatePayload): Observable<RoomType> {
        return this.http.put<RoomType>(`${this.apiUrl}/${id}`, payload);
    }

    deleteRoomType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
} 