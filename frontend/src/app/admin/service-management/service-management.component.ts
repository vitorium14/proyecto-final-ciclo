import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceService } from '../../services/service.service'; // Import ServiceService
// import { Service } from '../../models/service.model'; // Import Service model later

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-management.component.html',
  styleUrl: './service-management.component.scss'
})
export class ServiceManagementComponent implements OnInit {
  services: any[] = []; // Replace 'any' with Service model later
  isLoading = false;
  error: string | null = null;

  // Inject ServiceService
  constructor(private serviceService: ServiceService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.error = null;
    // Call the service to get services
    this.serviceService.getServices().subscribe({
      next: (data) => {
        this.services = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load services.';
        console.error('Error loading services:', err);
        this.isLoading = false;
      }
    });
  }

  // Add methods for editService, deleteService, createService later
}