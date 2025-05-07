import { Component, OnInit } from '@angular/core';
import { RoomType, RoomTypeResponse } from '../../../models/room.model';
import { RoomService } from '../../../services/room.service';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-type-list',
  templateUrl: './room-type-list.component.html',
  styleUrls: ['./room-type-list.component.css'],
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, ReactiveFormsModule, CurrencyPipe]
})
export class RoomTypeListComponent implements OnInit {
  roomTypes: RoomType[] = [];
  totalRoomTypes: number = 0;
  isLoading: boolean = false;
  error: string | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  filterForm: FormGroup;

  constructor(
    private roomService: RoomService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoomTypes();
    
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadRoomTypes();
    });
  }

  loadRoomTypes(): void {
    this.isLoading = true;
    this.error = null;
    
    this.roomService.getRoomTypes().subscribe({
      next: (response: RoomTypeResponse) => {
        this.roomTypes = response.room_types;
        this.totalRoomTypes = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching room types', err);
        this.error = 'Error al cargar los tipos de habitaciones';
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      searchTerm: ''
    });
    this.currentPage = 1;
    this.loadRoomTypes();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadRoomTypes();
  }

  deleteRoomType(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este tipo de habitación?')) {
      this.roomService.deleteRoomType(id).subscribe({
        next: () => {
          this.loadRoomTypes();
        },
        error: (err) => {
          console.error('Error deleting room type', err);
          this.error = 'Error al eliminar el tipo de habitación';
        }
      });
    }
  }
  
  // Helper method to create an array of page numbers for pagination
  get pageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalRoomTypes / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
} 