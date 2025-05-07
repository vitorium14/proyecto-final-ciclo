import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Service } from '../../../models/service.model';
import { ServiceService } from '../../../services/service.service';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.css'],
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, NgClass, NgForOf]
})
export class ServiceFormComponent implements OnInit {
  serviceForm: FormGroup;
  isEditMode: boolean = false;
  serviceId: number | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  
  // Service categories and status options
  categoryOptions = [
    { value: 'spa', label: 'Spa' },
    { value: 'restaurant', label: 'Restaurante' },
    { value: 'transport', label: 'Transporte' },
    { value: 'activities', label: 'Actividades' },
    { value: 'other', label: 'Otros' }
  ];
  
  statusOptions = [
    { value: 'available', label: 'Disponible' },
    { value: 'unavailable', label: 'No disponible' },
    { value: 'seasonal', label: 'Temporal' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService
  ) {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      status: ['available', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.serviceId = +id;
      this.loadService(this.serviceId);
    }
  }

  loadService(id: number): void {
    this.isLoading = true;
    this.serviceService.getService(id).subscribe({
      next: (service) => {
        this.serviceForm.patchValue({
          name: service.name,
          description: service.description,
          price: service.price,
          category: service.category || '',
          status: service.status || 'available'
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching service', err);
        this.error = 'Error al cargar el servicio';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      return;
    }

    this.isLoading = true;
    const serviceData = this.serviceForm.value;

    if (this.isEditMode && this.serviceId) {
      this.serviceService.updateService(this.serviceId, serviceData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/services']);
        },
        error: (err) => {
          console.error('Error updating service', err);
          this.error = 'Error al actualizar el servicio';
          this.isLoading = false;
        }
      });
    } else {
      this.serviceService.createService(serviceData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/services']);
        },
        error: (err) => {
          console.error('Error creating service', err);
          this.error = 'Error al crear el servicio';
          this.isLoading = false;
        }
      });
    }
  }
} 