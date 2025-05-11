import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceService } from '../../services/service.service';
import { Service as ApiService } from '../../models/api.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  services: ApiService[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private serviceService: ServiceService) { }

  ngOnInit(): void {
    this.loadServices();
    // Inicializar filtros de servicios después de cargar la página
    this.initializeFilters();
  }

  // Cargar los servicios desde el API
  loadServices(): void {
    this.loading = true;
    this.serviceService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading services: ' + err.message;
        this.loading = false;
        console.error('Error loading services:', err);
      }
    });
  }

  // Inicializa los filtros y agrega eventos a los botones
  private initializeFilters(): void {
    setTimeout(() => {
      const categoryPills = document.querySelectorAll('.category-pill');
      const serviceGroups = document.querySelectorAll('.service-group');

      // Agregar evento click a cada botón de categoría
      categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
          // Remover clase active de todos los pills
          categoryPills.forEach(p => p.classList.remove('active'));
          
          // Agregar clase active al pill clickeado
          pill.classList.add('active');
          
          // Obtener el valor del target (wellness, gastronomy, etc)
          const targetValue = pill.getAttribute('data-target');
          
          // Mostrar u ocultar los grupos de servicios según la categoría
          if (targetValue === 'all') {
            // Mostrar todos los grupos
            serviceGroups.forEach(group => {
              group.classList.remove('d-none');
              setTimeout(() => {
                group.classList.add('animate__fadeIn');
              }, 100);
            });
          } else {
            // Mostrar solo el grupo seleccionado
            serviceGroups.forEach(group => {
              if (group.id === targetValue) {
                group.classList.remove('d-none');
                setTimeout(() => {
                  group.classList.add('animate__fadeIn');
                }, 100);
              } else {
                group.classList.add('d-none');
                group.classList.remove('animate__fadeIn');
              }
            });
          }
        });
      });
    }, 500);
  }
}
