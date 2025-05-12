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
    // Inicializar filtros de habitaciones después de cargar la página
    this.initializeFilters();
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

  // Inicializa los filtros y agrega eventos a los botones
  private initializeFilters(): void {
    setTimeout(() => {
      const filterButtons = document.querySelectorAll('.filter-button');
      const roomItems = document.querySelectorAll('.room-item');

      // Agregar evento click a cada botón de filtro
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remover clase active de todos los botones
          filterButtons.forEach(btn => btn.classList.remove('active'));
          
          // Agregar clase active al botón clickeado
          button.classList.add('active');
          
          // Obtener el valor del filtro (capacidad)
          const filterValue = button.getAttribute('data-filter');
          
          // Filtrar las habitaciones
          roomItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-capacity') === filterValue || (filterValue === '3' && parseInt(item.getAttribute('data-capacity') || '0') >= 3)) {
              item.classList.remove('d-none');
              setTimeout(() => {
                item.classList.add('animate__fadeIn');
              }, 100);
            } else {
              item.classList.add('d-none');
              item.classList.remove('animate__fadeIn');
            }
          });
        });
      });
    }, 500);
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
