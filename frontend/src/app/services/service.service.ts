import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service, ServiceFilterOptions, ServiceResponse } from '../models/service.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private baseUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) { }

  // Service CRUD operations
  getServices(filters?: ServiceFilterOptions): Observable<ServiceResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.active !== undefined) params = params.set('active', filters.active.toString());
      if (filters.status) params = params.set('status', filters.status);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.searchTerm) params = params.set('search', filters.searchTerm);
    }
    
    return this.http.get<ServiceResponse>(this.baseUrl, { params });
  }

  getService(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.baseUrl}/${id}`);
  }

  createService(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(this.baseUrl, service);
  }

  updateService(id: number, service: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${this.baseUrl}/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Update the service status according to API docs
  updateServiceStatus(id: number, status: string): Observable<Service> {
    return this.http.patch<Service>(`${this.baseUrl}/${id}/status`, { status });
  }
  
  // Public service request method
  requestService(serviceRequestData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/request`, serviceRequestData);
  }
} 