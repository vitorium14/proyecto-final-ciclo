import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// Removed HttpClient, of
import { catchError, finalize } from 'rxjs/operators';
import { RoomService } from '../../services/room.service'; // Import RoomService
import { Room } from '../../models/room.model'; // Import Room model

@Component({
  selector: 'app-room-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-management.component.html',
  styleUrls: ['./room-management.component.scss']
})
export class RoomManagementComponent implements OnInit {
  // Estados y variables
  isLoading = false;
  error: string | null = null;
  isSubmitting = false;
  
  // Datos de habitaciones
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  totalRooms = 0;
  
  // Variables para filtrado
  searchTerm = '';
  filterType = '';
  filterStatus = '';
  
  // Variables para paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // Variables para modales
  newRoom: Room = this.initializeNewRoom();
  selectedRoom: Room = this.initializeNewRoom();
  
  // Referencia al modal activo
  private activeModal: NgbModalRef | null = null;

  // Opciones para dropdowns
  availableTypes = [
    { value: 'standard', label: 'Estándar' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'suite', label: 'Suite' }
  ];
  availableStatuses = [
    { value: 'available', label: 'Disponible' },
    { value: 'occupied', label: 'Ocupada' },
    { value: 'maintenance', label: 'Mantenimiento' }
  ];

  constructor(
    private roomService: RoomService, // Inject RoomService
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.loadRooms();
  }
  
  // Método para cargar habitaciones
  loadRooms() {
    this.isLoading = true;
    this.error = null;

    this.roomService.getRooms()
      .pipe(
        // Removed catchError here, service handles it
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (rooms) => {
          this.rooms = rooms;
          this.applyFilters(); // Apply filters after loading
        },
        error: (err) => {
          this.error = err.message || 'No se pudieron cargar las habitaciones.';
          console.error('Error loading rooms:', err);
          this.rooms = []; // Clear rooms on error
          this.applyFilters(); // Update filtered list
        }
      });
  }
  
  // Métodos para filtrado
  applyFilters() {
    this.filteredRooms = this.rooms.filter(room => {
      const matchesSearch = !this.searchTerm || 
                           room.number.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           room.type.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.filterType || room.type === this.filterType;
      const matchesStatus = !this.filterStatus || room.status === this.filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
    
    this.totalRooms = this.filteredRooms.length;
    this.calculateTotalPages();
    this.currentPage = 1; // Reset to first page
  }
  
  resetFilters() {
    this.searchTerm = '';
    this.filterType = '';
    this.filterStatus = '';
    this.applyFilters();
  }
  
  // Métodos para paginación
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRooms / this.pageSize);
  }
  
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  getPageArray(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  
  // Métodos para modales usando NgbModal
  openAddRoomModal(content: TemplateRef<any>) {
    this.newRoom = this.initializeNewRoom();
    this.activeModal = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true });
  }
  
  openEditRoomModal(content: TemplateRef<any>, room: Room) {
    this.selectedRoom = { ...room };
    this.activeModal = this.modalService.open(content, { ariaLabelledBy: 'modal-edit-title', centered: true });
  }
  
  openDeleteRoomModal(content: TemplateRef<any>, room: Room) {
    this.selectedRoom = room;
    this.activeModal = this.modalService.open(content, { ariaLabelledBy: 'modal-delete-title', centered: true, size: 'sm' });
  }
  
  // Métodos para CRUD de habitaciones
  addRoom() {
    this.isSubmitting = true;
    this.error = null; // Clear previous errors

    // Prepare data, excluding id
    const roomData: Omit<Room, 'id'> = {
      number: this.newRoom.number,
      type: this.newRoom.type,
      capacity: this.newRoom.capacity,
      price: this.newRoom.price,
      status: this.newRoom.status,
      image: this.newRoom.image || undefined // Ensure optional fields are handled
    };

    this.roomService.createRoom(roomData)
      .pipe(
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (newRoom) => {
          this.rooms.unshift(newRoom); // Add to the beginning of the main list
          this.applyFilters(); // Re-apply filters to update view
          this.activeModal?.close('Room added');
          console.log('Room created successfully:', newRoom);
          // Consider adding a success toast/notification here
        },
        error: (err) => {
          this.error = err.message || 'Error al crear la habitación.';
          console.error('Error creating room:', err);
          // Keep modal open on error? Or display error within modal?
        }
      });
  }
  
  updateRoom() {
    if (!this.selectedRoom || this.selectedRoom.id === undefined) {
      console.error('Cannot update room without a selected room ID.');
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // Prepare data - send only necessary fields if using PATCH, or full object for PUT
    // Using PATCH with Partial<Room> as defined in service
    const roomData: Partial<Room> = {
      number: this.selectedRoom.number,
      type: this.selectedRoom.type,
      capacity: this.selectedRoom.capacity,
      price: this.selectedRoom.price,
      status: this.selectedRoom.status,
      image: this.selectedRoom.image || undefined
    };

    this.roomService.updateRoom(this.selectedRoom.id, roomData)
      .pipe(
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (updatedRoom) => {
          const index = this.rooms.findIndex(r => r.id === updatedRoom.id);
          if (index !== -1) {
            this.rooms[index] = updatedRoom; // Update the main list
            this.applyFilters(); // Re-apply filters
          }
          this.activeModal?.close('Room updated');
          console.log('Room updated successfully:', updatedRoom);
          // Consider adding a success toast/notification here
        },
        error: (err) => {
          this.error = err.message || 'Error al actualizar la habitación.';
          console.error('Error updating room:', err);
        }
      });
  }
  
  deleteRoom() {
    if (!this.selectedRoom || this.selectedRoom.id === undefined) {
       console.error('Cannot delete room without a selected room ID.');
       return;
    }

    this.isSubmitting = true;
    this.error = null;
    const roomIdToDelete = this.selectedRoom.id;

    this.roomService.deleteRoom(roomIdToDelete)
      .pipe(
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.rooms = this.rooms.filter(r => r.id !== roomIdToDelete); // Update main list
          this.applyFilters(); // Re-apply filters
          this.activeModal?.close('Room deleted');
          console.log('Room deleted successfully:', roomIdToDelete);
          // Consider adding a success toast/notification here
        },
        error: (err) => {
          this.error = err.message || 'Error al eliminar la habitación.';
          console.error('Error deleting room:', err);
          // Keep modal open on error?
        }
      });
  }
  
  // Utilidades
  initializeNewRoom(): Room {
    return {
      number: '',
      type: '',
      capacity: 2,
      price: 0,
      status: 'available'
    };
  }
  
  getStatusLabel(status: string): string {
    const statusLabels: {[key: string]: string} = {
      'available': 'Disponible',
      'occupied': 'Ocupada',
      'maintenance': 'Mantenimiento'
    };
    
    return statusLabels[status] || status;
  }
  
  // Removed getMockRooms method
}