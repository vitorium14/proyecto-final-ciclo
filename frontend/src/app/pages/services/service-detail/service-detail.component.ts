import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { Service, ServiceStatus } from '../../../models/service.model';
import { ServiceService } from '../../../services/service.service';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.css'],
  standalone: true,
  imports: [NgIf, NgClass, RouterLink, CurrencyPipe, DatePipe]
})
export class ServiceDetailComponent implements OnInit {
  service: Service | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService
  ) { }

  getStatusLabel(status: ServiceStatus): string {
    return status === 'available' ? 'Disponible' : status === 'unavailable' ? 'No disponible' : 'Temporal';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadService(+id);
    } else {
      this.router.navigate(['/dashboard/services']);
    }
  }

  loadService(id: number): void {
    this.isLoading = true;
    this.serviceService.getService(id).subscribe({
      next: (service) => {
        this.service = service;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching service', err);
        this.error = 'Error al cargar el servicio';
        this.isLoading = false;
      }
    });
  }

  toggleStatus(): void {
    if (this.service) {
      this.serviceService.updateService(this.service.id, { status: this.service.status === 'available' ? 'unavailable' : 'available' }).subscribe({
        next: (updatedService) => {
          this.service = updatedService;
        },
        error: (err) => {
          console.error('Error toggling service status', err);
          this.error = 'Error al cambiar el estado del servicio';
        }
      });
    }
  }

  deleteService(): void {
    if (this.service && confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.serviceService.deleteService(this.service.id).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/services']);
        },
        error: (err) => {
          console.error('Error deleting service', err);
          this.error = 'Error al eliminar el servicio';
        }
      });
    }
  }
} 