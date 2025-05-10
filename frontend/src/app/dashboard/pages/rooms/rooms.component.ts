import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Room } from '../../../models/api.model';
import { RoomService } from '../../../services/room.service';

@Component({
    selector: 'app-rooms',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './rooms.component.html',
    styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {
    rooms: Room[] = [];
    private roomService = inject(RoomService);

    ngOnInit(): void {
        this.loadRooms();
    }

    loadRooms(): void {
        this.roomService.getAllRooms().subscribe({
            next: (data) => {
                this.rooms = data;
            },
            error: (err) => {
                console.error('Error fetching rooms:', err);
                // TODO: Implement user-friendly error handling
            }
        });
    }

    deleteRoom(roomId: number): void {
        // TODO: Add confirmation dialog before deleting
        this.roomService.deleteRoom(roomId).subscribe({
            next: () => {
                this.rooms = this.rooms.filter(room => room.id !== roomId);
                // TODO: Show success message
            },
            error: (err) => {
                console.error('Error deleting room:', err);
                // TODO: Implement user-friendly error handling
            }
        });
    }
} 