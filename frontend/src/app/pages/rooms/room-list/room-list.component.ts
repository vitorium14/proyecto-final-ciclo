import { Component, OnInit } from '@angular/core';
import { Room, RoomFilterOptions, RoomStatus, RoomType } from '../../../models/room.model';
import { RoomService } from '../../../services/room.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ReactiveFormsModule, RouterLink, CurrencyPipe]
})
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  roomTypes: RoomType[] = [];
  totalRooms: number = 0;
  isLoading: boolean = false;
  error: string | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  filterForm: FormGroup;
  
  // Define room status options array
  roomStatusOptions = [
    { value: 'available', label: 'Disponible', class: 'bg-success' },
    { value: 'occupied', label: 'Ocupada', class: 'bg-danger' },
    { value: 'cleaning', label: 'Limpieza', class: 'bg-warning' },
    { value: 'maintenance', label: 'Mantenimiento', class: 'bg-secondary' }
  ];

  constructor(
    private roomService: RoomService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      roomTypeId: [''],
      status: [''],
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoomTypes();
    this.loadRooms();
    
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadRooms();
    });
  }

  loadRoomTypes(): void {
    this.roomService.getRoomTypes().subscribe({
      next: (response) => {
        this.roomTypes = response.room_types;
      },
      error: (err) => {
        console.error('Error fetching room types', err);
        this.error = 'Error al cargar los tipos de habitaciones';
      }
    });
  }

  loadRooms(): void {
    this.isLoading = true;
    this.error = null;
    
    const filters: RoomFilterOptions = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.pageSize
    };
    
    // Remove empty values from filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof RoomFilterOptions] === '' || filters[key as keyof RoomFilterOptions] === null) {
        delete filters[key as keyof RoomFilterOptions];
      }
    });

    this.roomService.getRooms(filters).subscribe({
      next: (response) => {
        this.rooms = response.rooms;
        this.totalRooms = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching rooms', err);
        this.error = 'Error al cargar las habitaciones';
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      roomTypeId: '',
      status: '',
      searchTerm: ''
    });
    this.currentPage = 1;
    this.loadRooms();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadRooms();
  }

  getRoomStatusLabel(status?: RoomStatus): string {
    if (!status) return 'Desconocido';
    const option = this.roomStatusOptions.find(opt => opt.value === status);
    return option ? option.label : 'Desconocido';
  }

  getRoomStatusClass(status?: RoomStatus): string {
    if (!status) return '';
    const option = this.roomStatusOptions.find(opt => opt.value === status);
    return option ? option.class : '';
  }

  getRoomTypeName(roomType: RoomType | undefined): string {
    return roomType?.name ?? 'Desconocido';
  }

  deleteRoom(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta habitación?')) {
      this.roomService.deleteRoom(id).subscribe({
        next: () => {
          this.loadRooms();
        },
        error: (err) => {
          console.error('Error deleting room', err);
          this.error = 'Error al eliminar la habitación';
        }
      });
    }
  }
  
  // Helper method to create an array of page numbers for pagination
  get pageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalRooms / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
}
