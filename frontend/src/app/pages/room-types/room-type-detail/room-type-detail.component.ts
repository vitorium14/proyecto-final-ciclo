import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, NgClass, CurrencyPipe } from '@angular/common';
import { RoomService } from '../../../services/room.service';
import { RoomType, Image } from '../../../models/room.model';

@Component({
  selector: 'app-room-type-detail',
  templateUrl: './room-type-detail.component.html',
  styleUrls: ['./room-type-detail.component.css'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink, CurrencyPipe]
})
export class RoomTypeDetailComponent implements OnInit {
  roomType: RoomType | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  selectedImageIndex: number = 0;
  
  constructor(
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id) && id > 0) {
      this.loadRoomType(id);
    } else {
      this.error = 'ID de tipo de habitación no válido';
    }
  }

  loadRoomType(id: number): void {
    this.isLoading = true;
    
    this.roomService.getRoomType(id).subscribe({
      next: (roomType: RoomType) => {
        this.roomType = roomType;
        console.log('Loaded room type:', roomType); // Debug log
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading room type', err);
        this.error = 'Error al cargar el tipo de habitación';
        this.isLoading = false;
      }
    });
  }

  // Get image source (either base64 or path)
  getImageSrc(image: Image | undefined): string {
    if (!image) return '';
    
    // First try to use the image property (base64)
    if (image.image && image.image.length > 0) {
      return image.image;
    }
    
    // Fall back to path if available
    if (image.path && image.path.length > 0) {
      return image.path;
    }
    
    // If neither is available
    return '';
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  deleteRoomType(): void {
    if (!this.roomType) return;
    
    if (confirm(`¿Estás seguro de que deseas eliminar el tipo de habitación "${this.roomType.name}"?`)) {
      this.isLoading = true;
      
      this.roomService.deleteRoomType(this.roomType.id).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/room-types']);
        },
        error: (err) => {
          console.error('Error deleting room type', err);
          this.error = 'Error al eliminar el tipo de habitación';
          this.isLoading = false;
        }
      });
    }
  }
} 