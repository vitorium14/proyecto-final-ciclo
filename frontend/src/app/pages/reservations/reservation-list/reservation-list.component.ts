import { Component, OnInit } from '@angular/core';
import { Reservation, ReservationFilterOptions, ReservationStatus } from '../../../models/reservation.model';
import { ReservationService } from '../../../services/reservation.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-reservation-list',
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.css'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe]
})
export class ReservationListComponent implements OnInit {
  reservations: Reservation[] = [];
  totalReservations: number = 0;
  isLoading: boolean = false;
  error: string | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  filterForm: FormGroup;
  
  // Define reservation status options array
  reservationStatusOptions = [
    { value: 'pending', label: 'Pendiente', class: 'bg-warning' },
    { value: 'confirmed', label: 'Confirmada', class: 'bg-success' },
    { value: 'cancelled', label: 'Cancelada', class: 'bg-danger' },
    { value: 'completed', label: 'Completada', class: 'bg-info' }
  ];

  constructor(
    private reservationService: ReservationService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      roomId: [''],
      userId: [''],
      status: [''],
      startDate: [''],
      endDate: [''],
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadReservations();
    
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadReservations();
    });
  }

  loadReservations(): void {
    this.isLoading = true;
    this.error = null;
    
    const filters: ReservationFilterOptions = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.pageSize
    };
    
    // Remove empty values from filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof ReservationFilterOptions] === '' || filters[key as keyof ReservationFilterOptions] === null) {
        delete filters[key as keyof ReservationFilterOptions];
      }
    });

    this.reservationService.getReservations(filters).subscribe({
      next: (response) => {
        this.reservations = response.reservations;
        this.totalReservations = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reservations', err);
        this.error = 'Error al cargar las reservas';
        this.toastService.error(this.error, 'Error');
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      roomId: '',
      userId: '',
      status: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    this.currentPage = 1;
    this.loadReservations();
    this.toastService.info('Filtros restablecidos', 'Información');
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadReservations();
  }

  getReservationStatusLabel(status?: ReservationStatus): string {
    if (!status) return 'Desconocido';
    const option = this.reservationStatusOptions.find(opt => opt.value === status);
    return option ? option.label : 'Desconocido';
  }

  getReservationStatusClass(status?: ReservationStatus): string {
    if (!status) return '';
    const option = this.reservationStatusOptions.find(opt => opt.value === status);
    return option ? option.class : '';
  }

  deleteReservation(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      this.reservationService.deleteReservation(id).subscribe({
        next: () => {
          this.toastService.success('Reserva eliminada correctamente', 'Éxito');
          this.loadReservations();
        },
        error: (err) => {
          console.error('Error deleting reservation', err);
          this.error = 'Error al eliminar la reserva';
          this.toastService.error(this.error, 'Error');
        }
      });
    }
  }
  
  // Helper method to create an array of page numbers for pagination
  get pageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalReservations / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
} 