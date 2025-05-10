import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomTypeService } from '../../services/room-type.service';
import { RoomType } from '../../models/api.model';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsComponent implements OnInit {
  roomTypes: RoomType[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private roomTypeService: RoomTypeService) { }

  ngOnInit(): void {
    this.loadRoomTypes();
    // Inicializar filtros de habitaciones después de cargar la página
    this.initializeFilters();
  }

  // Cargar los tipos de habitaciones desde el API
  loadRoomTypes(): void {
    this.loading = true;
    this.roomTypeService.getAllRoomTypes().subscribe({
      next: (data) => {
        this.roomTypes = data;
        this.loading = false;
        console.log('Room types loaded:', this.roomTypes);
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
}
