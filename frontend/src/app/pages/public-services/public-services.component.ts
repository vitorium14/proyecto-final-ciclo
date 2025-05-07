import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service, ServiceStatus } from '../../models/service.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-public-services',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './public-services.component.html',
  styleUrls: ['./public-services.component.css']
})
export class PublicServicesComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  categories: string[] = [];
  selectedCategory: string | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  searchTerm: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/services`)
      .subscribe({
        next: (response) => {
          this.services = response.services || [];
          this.filteredServices = [...this.services];
          this.extractCategories();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading services', err);
          this.error = 'No se pudieron cargar los servicios. Por favor, inténtelo de nuevo más tarde.';
          this.isLoading = false;
          
          // Use mockup data for development
          this.loadMockData();
        }
      });
  }

  // Mockup data for development purposes
  loadMockData(): void {
    this.services = [
      {
        id: 1,
        name: 'Desayuno Buffet',
        description: 'Disfrute de un desayuno buffet completo con productos frescos y de calidad. Incluye café, té, zumos, bollería, embutidos, huevos y mucho más.',
        price: 15,
        category: 'Restauración',
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        duration: 90,
        images: [
          { id: 1, image: 'https://images.unsplash.com/photo-1533089860892-a9b969df67d3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80' }
        ]
      },
      {
        id: 2,
        name: 'Servicio de Lavandería',
        description: 'Servicio completo de lavandería para todas sus prendas. Recogida y entrega en su habitación en menos de 24 horas.',
        price: 20,
        category: 'Limpieza',
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        images: [
          { id: 2, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80' }
        ]
      },
      {
        id: 3,
        name: 'Masaje Relajante',
        description: 'Disfrute de un masaje relajante realizado por profesionales cualificados. Ideal para aliviar el estrés y la tensión muscular.',
        price: 60,
        category: 'Bienestar',
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        duration: 60,
        images: [
          { id: 3, image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80' }
        ]
      },
      {
        id: 4,
        name: 'Alquiler de Bicicletas',
        description: 'Explore la zona a su propio ritmo con nuestro servicio de alquiler de bicicletas. Incluye casco, candado y mapa de rutas recomendadas.',
        price: 15,
        category: 'Actividades',
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        duration: 240,
        images: [
          { id: 4, image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80' }
        ]
      },
      {
        id: 5,
        name: 'Servicio de Habitaciones 24h',
        description: 'Servicio de comidas y bebidas en su habitación las 24 horas del día. Consulte nuestro menú en la habitación.',
        price: 5,
        category: 'Restauración',
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        images: [
          { id: 5, image: 'https://images.unsplash.com/photo-1584132905271-512c958d674a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80' }
        ]
      },
      {
        id: 6,
        name: 'Transporte al Aeropuerto',
        description: 'Servicio de transporte privado desde y hacia el aeropuerto. Disponible 24/7 con reserva previa.',
        price: 45,
        category: 'Transporte',
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        images: [
          { id: 6, image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80' }
        ]
      }
    ];
    
    this.filteredServices = [...this.services];
    this.extractCategories();
  }

  extractCategories(): void {
    const categorySet = new Set<string>();
    this.services.forEach(service => {
      if (service.category) {
        categorySet.add(service.category);
      }
    });
    this.categories = Array.from(categorySet);
  }

  filterByCategory(category: string | null): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  search(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredServices = this.services.filter(service => {
      // Filter by category if selected
      const categoryMatch = !this.selectedCategory || service.category === this.selectedCategory;
      
      // Filter by search term if provided
      const searchMatch = !this.searchTerm || 
        service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
  }

  getStatusClass(status: ServiceStatus): string {
    switch (status) {
      case 'available': return 'bg-success';
      case 'unavailable': return 'bg-danger';
      case 'seasonal': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getStatusText(status: ServiceStatus): string {
    switch (status) {
      case 'available': return 'Disponible';
      case 'unavailable': return 'No Disponible';
      case 'seasonal': return 'Temporada';
      default: return 'Desconocido';
    }
  }

  requestService(service: Service): void {
    if (this.authService.isAuthenticated()) {
      // Si el usuario está autenticado, redirigir al formulario de solicitud de servicio
      this.router.navigate(['/solicitar-servicio'], { 
        queryParams: { serviceId: service.id } 
      });
    } else {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: '/solicitar-servicio',
          serviceId: service.id 
        } 
      });
    }
  }

  requestInfo(service: Service): void {
    this.router.navigate(['/contacto'], { 
      queryParams: { 
        subject: `Información sobre ${service.name}`,
        serviceId: service.id
      } 
    });
  }
} 