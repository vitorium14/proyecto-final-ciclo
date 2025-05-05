import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Import Room model later
// import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = 'http://localhost:8000/api/rooms';

  constructor(private http: HttpClient) {}

  // GET /api/rooms - Public
  getRooms(): Observable<any[]> { // Replace 'any' with Room model
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/rooms/{id} - Public (or Authenticated?)
  getRoom(id: number): Observable<any> { // Replace 'any' with Room model
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // POST /api/rooms - Employee/Admin only
  createRoom(roomData: any): Observable<any> { // Replace 'any' with Room model/create DTO
    return this.http.post<any>(this.apiUrl, roomData).pipe(
      catchError(this.handleError)
    );
  }

  // PATCH /api/rooms/{id} - Employee/Admin only
  updateRoom(id: number, roomData: any): Observable<any> { // Replace 'any' with Room model/update DTO
    return this.http.patch<any>(`${this.apiUrl}/${id}`, roomData).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE /api/rooms/{id} - Employee/Admin only
  deleteRoom(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Basic error handling (could be centralized)
  private handleError(error: HttpErrorResponse) {
    let msg = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      msg = `Error: ${error.error.message}`;
    } else {
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        msg = error.error.message;
      }
    }
    console.error(error);
    return throwError(() => new Error(msg));
  }
}