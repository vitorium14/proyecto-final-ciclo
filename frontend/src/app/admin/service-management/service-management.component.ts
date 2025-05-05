import { Component, OnInit, TemplateRef } from '@angular/core'; // Added TemplateRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'; // Added NgbModal, NgbModalRef
// Removed HttpClient, of
import { catchError, finalize } from 'rxjs/operators';
import { ServiceService } from '../../services/service.service'; // Import ServiceService
import { Service } from '../../models/service.model'; // Import Service model

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.scss']
})
export class ServiceManagementComponent implements OnInit {
  // Estados
  isLoading = false;
  error: string | null = null;
  isSubmitting = false;

  // Datos de servicios
  services: Service[] = [];
  filteredServices: Service[] = [];
  totalServices = 0;

  // Filtros
  searchTerm = '';
  filterCategory = '';

  // Paginación
  currentPage = 1;
  pageSize = 12; // Para mostrar en cuadrícula 3x4
  totalPages = 1;

  // Variables para modales
  newService: Service = this.initializeNewService();
  selectedService: Service = this.initializeNewService();
  private activeModal: NgbModalRef | null = null; // Added activeModal property

  constructor(
    private serviceService: ServiceService, // Inject ServiceService
    private modalService: NgbModal // Injected NgbModal
  ) { }

  ngOnInit() {
    this.loadServices();
  }

  // Carga los servicios desde la API
  loadServices() {
    this.isLoading = true;
    this.error = null;

    this.serviceService.getServices()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (services) => {
          this.services = services;
          this.applyFilters(); // Apply filters after loading
        },
        error: (err) => {
          this.error = err.message || 'No se pudieron cargar los servicios.';
          console.error('Error loading services:', err);
          this.services = []; // Clear services on error
          this.applyFilters(); // Update filtered list
        }
      });
  }

  // Aplica filtros a la lista de servicios
  applyFilters() {
    this.filteredServices = this.services.filter(service => {
      const matchesSearch = !this.searchTerm ||
                           service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.filterCategory || service.category === this.filterCategory;

      return matchesSearch && matchesCategory;
    });

    this.totalServices = this.filteredServices.length;
    this.calculateTotalPages();
    this.currentPage = 1; // Resetear a la primera página
  }

  // Reinicia los filtros
  resetFilters() {
    this.searchTerm = '';
    this.filterCategory = '';
    this.filteredServices = [...this.services];
    this.totalServices = this.services.length;
    this.calculateTotalPages();
    this.currentPage = 1;
  }

  // Calcula el número total de páginas
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalServices / this.pageSize);
  }

  // Cambia la página actual
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Obtiene el array de números de página para mostrar
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
  openAddServiceModal(content: TemplateRef<any>) {
    this.newService = this.initializeNewService();
    this.activeModal = this.modalService.open(content, { ariaLabelledBy: 'modal-add-service-title', centered: true, size: 'lg' });
  }

  openEditServiceModal(content: TemplateRef<any>, service: Service) {
    this.selectedService = { ...service };
    this.activeModal = this.modalService.open(content, { ariaLabelledBy: 'modal-edit-service-title', centered: true, size: 'lg' });
  }

  openDeleteServiceModal(content: TemplateRef<any>, service: Service) {
    this.selectedService = { ...service };
    this.activeModal = this.modalService.open(content, { ariaLabelledBy: 'modal-delete-service-title', centered: true });
  }

  // Métodos para CRUD de servicios
  addService() {
    this.isSubmitting = true;
    this.error = null;

    // Prepare data, excluding id
    const serviceData: Omit<Service, 'id'> = {
      name: this.newService.name,
      description: this.newService.description,
      price: this.newService.price,
      duration: this.newService.duration,
      category: this.newService.category,
      image: this.newService.image || undefined
    };

    this.serviceService.createService(serviceData)
      .pipe(
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (newService) => {
          this.services.unshift(newService);
          this.applyFilters();
          this.activeModal?.close('Service added');
          console.log('Service created successfully:', newService);
          // TODO: Replace alert with a toast notification
          alert('Servicio creado con éxito');
        },
        error: (err) => {
          this.error = err.message || 'Error al crear el servicio.';
          console.error('Error creating service:', err);
          // TODO: Replace alert with a toast notification or display error in modal
          alert('Error al crear el servicio: ' + this.error);
        }
      });
  }

  updateService() {
    if (!this.selectedService || this.selectedService.id === undefined) {
      console.error('Cannot update service without a selected service ID.');
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // Prepare data for PATCH
    const serviceData: Partial<Service> = {
      name: this.selectedService.name,
      description: this.selectedService.description,
      price: this.selectedService.price,
      duration: this.selectedService.duration,
      category: this.selectedService.category,
      image: this.selectedService.image || undefined
    };

    this.serviceService.updateService(this.selectedService.id, serviceData)
      .pipe(
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (updatedService) => {
          const index = this.services.findIndex(s => s.id === updatedService.id);
          if (index !== -1) {
            this.services[index] = updatedService;
            this.applyFilters();
          }
          this.activeModal?.close('Service updated');
          console.log('Service updated successfully:', updatedService);
          // TODO: Replace alert with a toast notification
          alert('Servicio actualizado con éxito');
        },
        error: (err) => {
          this.error = err.message || 'Error al actualizar el servicio.';
          console.error('Error updating service:', err);
          // TODO: Replace alert with a toast notification or display error in modal
          alert('Error al actualizar el servicio: ' + this.error);
        }
      });
  }

  deleteService() {
    if (!this.selectedService || this.selectedService.id === undefined) {
      console.error('Cannot delete service without a selected service ID.');
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    const serviceIdToDelete = this.selectedService.id;

    this.serviceService.deleteService(serviceIdToDelete)
      .pipe(
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.services = this.services.filter(s => s.id !== serviceIdToDelete);
          this.applyFilters();
          this.activeModal?.close('Service deleted');
          console.log('Service deleted successfully:', serviceIdToDelete);
          // TODO: Replace alert with a toast notification
          alert('Servicio eliminado con éxito');
        },
        error: (err) => {
          this.error = err.message || 'Error al eliminar el servicio.';
          console.error('Error deleting service:', err);
          // TODO: Replace alert with a toast notification or display error in modal
          alert('Error al eliminar el servicio: ' + this.error);
        }
      });
  }

  // Utilidad para inicializar un nuevo servicio
  // Make sure this aligns with the Service model (id is optional)
  initializeNewService(): Service {
    return {
      // id is omitted
      name: '',
      description: '',
      price: 0,
      duration: 0,
      category: ''
    };
  }

  // Obtiene la etiqueta legible para una categoría
  getCategoryLabel(category: string): string {
    const categoryLabels: {[key: string]: string} = {
      'wellness': 'Bienestar',
      'food': 'Alimentación',
      'activity': 'Actividades',
      'amenity': 'Comodidades'
    };
    return categoryLabels[category] || category;
  }

  // Handle file selection and convert to Base64
  onFileSelected(event: Event, mode: 'new' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      // Simple type validation
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Tipo de archivo no permitido. Use PNG, JPG o WEBP.';
        input.value = ''; // Clear the input
        return;
      }

      // Clear error if validation passes
      this.error = null;

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const base64String = e.target?.result as string;
        if (mode === 'new') {
          this.newService.image = base64String;
        } else if (mode === 'edit') {
          this.selectedService.image = base64String;
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        this.error = 'Error al leer el archivo de imagen.';
      };

      reader.readAsDataURL(file); // Read file as Base64 Data URL
    }
  }

  // Removed getMockServices method
}