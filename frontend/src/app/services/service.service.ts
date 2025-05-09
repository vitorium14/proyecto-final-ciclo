import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service as ApiService, Image } from '../models/api.model'; // Renamed Service to ApiService to avoid name collision

@Injectable({
    providedIn: 'root'
})
export class ServiceService {
    private apiUrl = '/api/services'; // Assuming a global proxy is configured

    constructor(private http: HttpClient) { }

    getAllServices(): Observable<ApiService[]> {
        return this.http.get<ApiService[]>(this.apiUrl);
    }

    getServiceById(id: number): Observable<ApiService> {
        return this.http.get<ApiService>(`${this.apiUrl}/${id}`);
    }

    createService(service: Omit<ApiService, 'id' | 'images'> & { images?: Omit<Image, 'id'>[] }): Observable<ApiService> {
        return this.http.post<ApiService>(this.apiUrl, service);
    }

    updateService(id: number, service: Partial<Omit<ApiService, 'id' | 'images'> & { images?: Omit<Image, 'id'>[] }>): Observable<ApiService> {
        return this.http.put<ApiService>(`${this.apiUrl}/${id}`, service);
    }

    deleteService(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
} 