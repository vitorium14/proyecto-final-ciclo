import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    Service as ApiService, // Renamed Service to ApiService to avoid name collision
    ServiceCreationPayload,  // Added
    ServiceUpdatePayload,     // Added
    Image
} from '../models/api.model';
import { environment } from '../../environments/environment.prod';
@Injectable({
    providedIn: 'root'
})
export class ServiceService {
    private apiUrl = environment.apiUrl + '/services'; // Assuming a global proxy is configured

    constructor(private http: HttpClient) { }

    getAllServices(): Observable<ApiService[]> {
        return this.http.get<ApiService[]>(this.apiUrl);
    }

    getServiceById(id: number): Observable<ApiService> {
        return this.http.get<ApiService>(`${this.apiUrl}/${id}`);
    }

    createService(payload: ServiceCreationPayload): Observable<ApiService> {
        return this.http.post<ApiService>(this.apiUrl, payload);
    }

    updateService(id: number, payload: ServiceUpdatePayload): Observable<ApiService> {
        return this.http.put<ApiService>(`${this.apiUrl}/${id}`, payload);
    }

    deleteService(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
} 