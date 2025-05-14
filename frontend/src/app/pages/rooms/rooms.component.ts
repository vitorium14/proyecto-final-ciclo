import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomTypeService } from '../../services/room-type.service';
import { RoomType } from '../../models/api.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsComponent implements OnInit {
  roomTypes: RoomType[] = [];
  loading: boolean = true;
  error: string | null = null;
  isAuthenticated: boolean = false;
  
  constructor(
    private roomTypeService: RoomTypeService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRoomTypes();
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  // Cargar los tipos de habitaciones desde el API
  loadRoomTypes(): void {
    this.loading = true;
    this.roomTypeService.getAllRoomTypes().subscribe({
      next: (roomTypes) => {
        this.roomTypes = roomTypes;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading room types: ' + err.message;
        this.loading = false;
        console.error('Error loading room types:', err);
      }
    });
  }

  // Filtro de habitaciones
  filterRooms(capacity: number, event: HTMLElement): void {
    if (capacity === 0) {
      this.roomTypes = this.roomTypes;
    } else {
      if (capacity >= 3) {
        this.roomTypes = this.roomTypes.filter(room => room.capacity >= 3);
      } else {
        this.roomTypes = this.roomTypes.filter(room => room.capacity === 3);
      }
    }

    const buttons = document.querySelectorAll('.filter-button');
    buttons.forEach(button => {
      if (button !== event) {
        button.classList.remove('active');
      }
    });

    event.classList.add('active');
  }

  // Abrir modal de reserva o redirigir a login si no está autenticado
  openBookingModal(roomType: RoomType): void {
    if (!this.authService.getToken()) {
      // Si no está autenticado, redirigir a login con parámetro de retorno
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: `/rooms?book=${roomType.id}` } 
      });
      return;
    }

    // Si está autenticado, crear una nueva ruta para un componente de reserva
    this.router.navigate(['/create-booking', roomType.id]);
  }
}
