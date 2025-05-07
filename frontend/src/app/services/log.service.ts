import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LogList, LogStats } from '../models/log.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = `${environment.apiUrl}/logs`;

  constructor(private http: HttpClient) { }

  getLogs(
    page: number = 1, 
    limit: number = 10, 
    userId?: number,
    action?: string,
    entityType?: string,
    entityId?: number,
    startDate?: string,
    endDate?: string
  ): Observable<LogList> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    
    if (userId) url += `&userId=${userId}`;
    if (action) url += `&action=${action}`;
    if (entityType) url += `&entityType=${entityType}`;
    if (entityId) url += `&entityId=${entityId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    return this.http.get<LogList>(url);
  }

  getLogStats(): Observable<LogStats> {
    return this.http.get<LogStats>(`${this.apiUrl}/stats`);
  }
} 