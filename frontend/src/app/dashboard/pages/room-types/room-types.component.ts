import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomType } from '../../../models/api.model';
import { RoomTypeService } from '../../../services/room-type.service';

@Component({
  selector: 'app-room-types',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './room-types.component.html',
  styleUrls: ['./room-types.component.css']
})
export class RoomTypesComponent implements OnInit {
  roomTypes: RoomType[] = [];
  private roomTypeService = inject(RoomTypeService);

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  loadRoomTypes(): void {
    this.roomTypeService.getAllRoomTypes().subscribe({
      next: (data) => {
        this.roomTypes = data;
      },
      error: (err) => {
        console.error('Error fetching room types:', err);
        // TODO: Implement user-friendly error handling
      }
    });
  }

  deleteRoomType(roomTypeId: number): void {
    // TODO: Add confirmation dialog before deleting
    this.roomTypeService.deleteRoomType(roomTypeId).subscribe({
      next: () => {
        this.roomTypes = this.roomTypes.filter(rt => rt.id !== roomTypeId);
        // TODO: Show success message
      },
      error: (err) => {
        console.error('Error deleting room type:', err);
        // TODO: Implement user-friendly error handling
      }
    });
  }

  getAmenitiesList(amenities: string[] | undefined): string {
    if (!amenities || amenities.length === 0) {
      return 'N/A';
    }
    return amenities.join(', ');
  }
} 