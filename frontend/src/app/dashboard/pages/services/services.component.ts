import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Service as ApiService } from '../../../models/api.model';
import { ServiceService } from '../../../services/service.service';

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
    services: ApiService[] = [];
    private serviceService = inject(ServiceService);

    ngOnInit(): void {
        this.loadServices();
    }

    loadServices(): void {
        this.serviceService.getAllServices().subscribe({
            next: (data) => {
                this.services = data;
            },
            error: (err) => {
                console.error('Error fetching services:', err);
                // TODO: Implement user-friendly error handling (e.g., show a toast message)
            }
        });
    }

    deleteService(serviceId: number): void {
        // TODO: Add confirmation dialog before deleting
        this.serviceService.deleteService(serviceId).subscribe({
            next: () => {
                this.services = this.services.filter(service => service.id !== serviceId);
                // TODO: Show success message (e.g., toast)
            },
            error: (err) => {
                console.error('Error deleting service:', err);
                // TODO: Implement user-friendly error handling
            }
        });
    }
} 