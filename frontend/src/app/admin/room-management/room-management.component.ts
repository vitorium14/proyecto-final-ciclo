import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service'; // Import RoomService
// import { Room } from '../../models/room.model'; // Import Room model later

@Component({
  selector: 'app-room-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-management.component.html',
  styleUrl: './room-management.component.scss'
})
export class RoomManagementComponent implements OnInit {
  rooms: any[] = []; // Replace 'any' with Room model later
  isLoading = false;
  error: string | null = null;

  // Inject RoomService
  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.isLoading = true;
    this.error = null;
    // Call the service to get rooms
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load rooms.';
        console.error('Error loading rooms:', err);
        this.isLoading = false;
      }
    });
  }

  // Add methods for editRoom, deleteRoom, createRoom later
}