import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    User,
    UserCreationPayload,
    UserUpdatePayload,
    LoginPayload,
    LoginResponse,
    LogoutPayload,
    LogoutResponse,
    PasswordChangePayload
} from '../models/api.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    // Assuming a global proxy is configured to point to the backend base URL
    // If /api is a global prefix, these paths are correct.
    // If not, /login, /register, /logout should be at the root.
    private authApiUrl = 'http://localhost:8000/api'; // For /login, /register, /logout
    private usersApiUrl = 'http://localhost:8000/api/users'; // For user management CRUD

    constructor(private http: HttpClient) { }

    // Auth Endpoints
    login(credentials: LoginPayload): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.authApiUrl}/login`, credentials);
    }

    register(userData: UserCreationPayload): Observable<User> { // Renamed from createUser
        // API doc says POST /register returns the user object with 201 Created
        return this.http.post<User>(`${this.authApiUrl}/register`, userData);
    }

    logout(payload: LogoutPayload): Observable<LogoutResponse> {
        // API doc says POST /logout, expects token in body
        return this.http.post<LogoutResponse>(`${this.authApiUrl}/logout`, payload);
    }

    // User Management Endpoints
    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.usersApiUrl);
    }

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.usersApiUrl}/${id}`);
    }

    updateUser(id: number, userData: UserUpdatePayload): Observable<User> {
        return this.http.put<User>(`${this.usersApiUrl}/${id}`, userData);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.usersApiUrl}/${id}`);
    }

    changePassword(id: number, passwordData: PasswordChangePayload): Observable<void> {
        return this.http.put<void>(`${this.usersApiUrl}/${id}/password`, passwordData);
    }
} 