import { Component, OnInit } from '@angular/core';
import { Service, ServiceFilterOptions, ServiceStatus } from '../../../models/service.model';
import { ServiceService } from '../../../services/service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ReactiveFormsModule, RouterLink, CurrencyPipe]
})
export class ServiceListComponent implements OnInit {
  services: Service[] = [];
  totalServices: number = 0;
  isLoading: boolean = false;
  error: string | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  filterForm: FormGroup;

  constructor(
    private serviceService: ServiceService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      active: [''],
      searchTerm: ['']
    });
  }

  getStatusLabel(status: ServiceStatus): string {
    return status === 'available' ? 'Disponible' : status === 'unavailable' ? 'No disponible' : 'Temporal';
  }

  ngOnInit(): void {
    this.loadServices();
    
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadServices();
    });
  }

  loadServices(): void {
    this.isLoading = true;
    this.error = null;
    
    const filters: ServiceFilterOptions = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.pageSize
    };
    
    // Remove empty values from filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof ServiceFilterOptions] === '' || filters[key as keyof ServiceFilterOptions] === null) {
        delete filters[key as keyof ServiceFilterOptions];
      }
    });

    this.serviceService.getServices(filters).subscribe({
      next: (response) => {
        this.services = response.services;
        this.totalServices = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching services', err);
        this.error = 'Error al cargar los servicios';
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      active: '',
      searchTerm: ''
    });
    this.currentPage = 1;
    this.loadServices();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadServices();
  }

  toggleStatus(service: Service): void {
    const newStatus = service.status === 'available' ? 'unavailable' : 'available';
    this.serviceService.updateService(service.id, { status: newStatus as ServiceStatus }).subscribe({
      next: () => {
        this.loadServices();
      },
      error: (err) => {
        console.error('Error toggling service status', err);
        this.error = 'Error al cambiar el estado del servicio';
      }
    });
  }

  deleteService(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.serviceService.deleteService(id).subscribe({
        next: () => {
          this.loadServices();
        },
        error: (err) => {
          console.error('Error deleting service', err);
          this.error = 'Error al eliminar el servicio';
        }
      });
    }
  }
  
  // Helper method to create an array of page numbers for pagination
  get pageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalServices / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
} 