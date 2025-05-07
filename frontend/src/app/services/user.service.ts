import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserCreate, UserList } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getUsers(page: number = 1, limit: number = 10, search: string = '', role: string = ''): Observable<UserList> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${search}`;
    }
    if (role) {
      url += `&role=${role}`;
    }
    return this.http.get<UserList>(url);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createPrivilegedUser(user: UserCreate): Observable<{ message: string, userId: number }> {
    return this.http.post<{ message: string, userId: number }>(`${this.apiUrl}/privileged`, user);
  }

  createClientUser(user: UserCreate): Observable<{ message: string, userId: number }> {
    return this.http.post<{ message: string, userId: number }>(`${this.apiUrl}/client`, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  updateUserRole(id: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/role`, { role });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 