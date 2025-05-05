import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'; // Import NgbModal
import { finalize } from 'rxjs/operators';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/reservation.model'; // Import Reservation model

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], // Add FormsModule and DatePipe
  templateUrl: './reservation-management.component.html',
  styleUrls: ['./reservation-management.component.scss'] // Use styleUrls
})
export class ReservationManagementComponent implements OnInit {
  // State
  isLoading = false;
  error: string | null = null;
  isSubmitting = false;

  // Data
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  totalReservations = 0;

  // Filtering
  searchTerm = ''; // Search by client name/email or room number
  filterStatus = ''; // e.g., 'pending', 'confirmed', 'cancelled'
  // TODO: Add date range filters if needed

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Modals
  selectedReservation: Reservation | null = null;
  private activeModal: NgbModalRef | null = null;

  // Available statuses for editing
  availableStatuses: string[] = ['pending', 'confirmed', 'cancelled', 'checked-in', 'checked-out'];

  constructor(
    private reservationService: ReservationService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.error = null;
    this.reservationService.getAllReservations()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.reservations = data;
          this.applyFilters(); // Apply filters after loading
        },
        error: (err) => {
          this.error = err.message || 'Failed to load reservations.';
          console.error('Error loading reservations:', err);
          this.reservations = [];
          this.applyFilters();
        }
      });
  }

  // Filtering Methods
  applyFilters(): void {
    this.filteredReservations = this.reservations.filter(reservation => {
      const matchesSearch = !this.searchTerm ||
                           reservation.client.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           reservation.client.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           reservation.room.number.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.filterStatus || reservation.status === this.filterStatus;

      // TODO: Add date range filtering logic here if implemented

      return matchesSearch && matchesStatus;
    });

    this.totalReservations = this.filteredReservations.length;
    this.calculateTotalPages();
    this.currentPage = 1; // Reset to first page on filter change
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    // TODO: Reset date filters if implemented
    this.applyFilters();
  }

  // Pagination Methods
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalReservations / this.pageSize);
  }

  changePage(page: number): void {
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

  // Modal Methods
  openEditReservationModal(content: TemplateRef<any>, reservation: Reservation): void {
    this.selectedReservation = { ...reservation }; // Create a copy for editing
    this.activeModal = this.modalService.open(content, { ariaLabelledBy: 'modal-edit-reservation-title', centered: true });
  }

  openDeleteReservationModal(content: TemplateRef<any>, reservation: Reservation): void {
    this.selectedReservation = reservation; // Direct reference okay for delete
    this.activeModal = this.modalService.open(content, { ariaLabelledBy: 'modal-delete-reservation-title', centered: true, size: 'sm' });
  }

  // CRUD Methods (Focus on Update Status and Delete for Admin)
  updateReservation(): void {
    if (!this.selectedReservation || !this.selectedReservation.id) {
      console.error('Cannot update reservation without a selected reservation ID.');
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // Prepare data - Admin might only update status or dates
    const reservationData: Partial<Reservation> = {
      status: this.selectedReservation.status
      // Add checkIn, checkOut if admin should be able to modify them
      // checkIn: this.selectedReservation.checkIn,
      // checkOut: this.selectedReservation.checkOut,
    };

    this.reservationService.updateReservation(this.selectedReservation.id, reservationData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (updatedReservation) => {
          const index = this.reservations.findIndex(r => r.id === updatedReservation.id);
          if (index !== -1) {
            this.reservations[index] = updatedReservation;
            this.applyFilters();
          }
          this.activeModal?.close('Reservation updated');
          console.log('Reservation updated successfully:', updatedReservation);
          // Add success notification
        },
        error: (err) => {
          this.error = err.message || 'Error al actualizar la reserva.';
          console.error('Error updating reservation:', err);
          // Add error notification
        }
      });
  }

  deleteReservation(): void {
    if (!this.selectedReservation || !this.selectedReservation.id) {
      console.error('Cannot delete reservation without a selected reservation ID.');
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    const reservationIdToDelete = this.selectedReservation.id;

    this.reservationService.deleteReservation(reservationIdToDelete)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.reservations = this.reservations.filter(r => r.id !== reservationIdToDelete);
          this.applyFilters();
          this.activeModal?.close('Reservation deleted');
          console.log('Reservation deleted successfully:', reservationIdToDelete);
          // Add success notification
        },
        error: (err) => {
          this.error = err.message || 'Error al eliminar la reserva.';
          console.error('Error deleting reservation:', err);
          // Add error notification
        }
      });
  }

  // Utility for displaying status with better labels
  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmada',
      'cancelled': 'Cancelada',
      'checked-in': 'Check-in',
      'checked-out': 'Check-out'
    };
    return statusLabels[status] || status;
  }

  // Utility for status badge class
  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-success';
      case 'checked-in': return 'bg-success';
      case 'pending': return 'bg-warning text-dark';
      case 'cancelled': return 'bg-danger';
      case 'checked-out': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }
}