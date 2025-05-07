import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomType, Image } from '../../models/room.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-public-rooms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-rooms.component.html',
  styleUrls: ['./public-rooms.component.css']
})
export class PublicRoomsComponent implements OnInit {
  roomTypes: RoomType[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  activeRoom: RoomType | null = null;
  activeImageIndex: number = 0;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  loadRoomTypes(): void {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/room-types`)
      .subscribe({
        next: (response) => {
          this.roomTypes = response.room_types || [];
          this.isLoading = false;
          if (this.roomTypes.length > 0) {
            this.setActiveRoom(this.roomTypes[0]);
          }
        },
        error: (err) => {
          console.error('Error loading room types', err);
          this.error = 'No se pudieron cargar las habitaciones. Por favor, inténtelo de nuevo más tarde.';
          this.isLoading = false;
          
          // Use mockup data for development
          this.loadMockData();
        }
      });
  }

  // Mockup data for development purposes
  loadMockData(): void {
    this.roomTypes = [
      {
        id: 1,
        name: 'Habitación Individual',
        price: 50,
        amenities: 'WiFi, Baño privado, TV, Aire acondicionado',
        images: [
          { id: 1, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80' },
          { id: 2, image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1057&q=80' }
        ]
      },
      {
        id: 2,
        name: 'Habitación Doble',
        price: 80,
        amenities: 'WiFi, Baño privado, TV, Aire acondicionado, Minibar',
        images: [
          { id: 3, image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80' },
          { id: 4, image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80' }
        ]
      },
      {
        id: 3,
        name: 'Suite',
        price: 120,
        amenities: 'WiFi, Baño privado con jacuzzi, TV, Aire acondicionado, Minibar, Sala de estar',
        images: [
          { id: 5, image: 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80' },
          { id: 6, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80' }
        ]
      }
    ];
    
    if (this.roomTypes.length > 0) {
      this.setActiveRoom(this.roomTypes[0]);
    }
  }

  setActiveRoom(room: RoomType): void {
    this.activeRoom = room;
    this.activeImageIndex = 0;
  }

  nextImage(): void {
    if (this.activeRoom && this.activeRoom.images) {
      this.activeImageIndex = (this.activeImageIndex + 1) % this.activeRoom.images.length;
    }
  }

  prevImage(): void {
    if (this.activeRoom && this.activeRoom.images) {
      this.activeImageIndex = (this.activeImageIndex - 1 + this.activeRoom.images.length) % this.activeRoom.images.length;
    }
  }

  getAmenityList(amenities: string | undefined): string[] {
    if (!amenities) return [];
    return amenities.split(',').map(item => item.trim());
  }

  reserveRoom(roomType: RoomType): void {
    if (this.authService.isAuthenticated()) {
      // Si el usuario está autenticado, redirigir al formulario de reserva
      this.router.navigate(['/reservar'], { 
        queryParams: { roomTypeId: roomType.id } 
      });
    } else {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: '/reservar',
          roomTypeId: roomType.id 
        } 
      });
    }
  }

  requestInfo(roomType: RoomType): void {
    this.router.navigate(['/contacto'], { 
      queryParams: { 
        subject: `Información sobre ${roomType.name}`,
        roomTypeId: roomType.id
      } 
    });
  }
} 