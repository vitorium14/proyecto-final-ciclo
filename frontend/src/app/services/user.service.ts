import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserCreationPayload, UserUpdatePayload } from '../models/api.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = '/api/users'; // Assuming a global proxy is configured to point to the backend base URL

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    createUser(user: UserCreationPayload): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    updateUser(id: number, user: UserUpdatePayload): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
} 