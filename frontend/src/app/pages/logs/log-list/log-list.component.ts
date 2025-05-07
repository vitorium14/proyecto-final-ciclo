import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Log } from '../../../models/log.model';
import { LogService } from '../../../services/log.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-log-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './log-list.component.html',
  styleUrls: ['./log-list.component.css']
})
export class LogListComponent implements OnInit {
  logs: Log[] = [];
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  users: User[] = [];
  
  filters = {
    userId: null as number | null,
    action: '',
    entityType: '',
    startDate: '',
    endDate: ''
  };
  
  actionOptions = [
    { value: '', label: 'Todas las acciones' },
    { value: 'create', label: 'Creación' },
    { value: 'update', label: 'Actualización' },
    { value: 'delete', label: 'Eliminación' }
  ];
  
  entityTypeOptions = [
    { value: '', label: 'Todas las entidades' },
    { value: 'user', label: 'Usuario' },
    { value: 'service', label: 'Servicio' },
    { value: 'reservation', label: 'Reserva' },
    { value: 'room', label: 'Habitación' }
  ];
  
  loading = false;
  error = '';

  constructor(
    private logService: LogService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadLogs();
  }

  loadUsers(): void {
    this.userService.getUsers(1, 100).subscribe({
      next: (response) => {
        this.users = response.users;
      },
      error: (err) => {
        console.error('Error loading users', err);
      }
    });
  }

  loadLogs(): void {
    this.loading = true;
    this.logService.getLogs(
      this.currentPage,
      this.itemsPerPage,
      this.filters.userId!,
      this.filters.action,
      this.filters.entityType,
      undefined,
      this.filters.startDate || undefined,
      this.filters.endDate || undefined
    ).subscribe({
      next: (response) => {
        this.logs = response.logs;
        this.totalItems = response.total;
        this.totalPages = response.pages;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar logs';
        this.loading = false;
        console.error('Error loading logs', err);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadLogs();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  resetFilters(): void {
    this.filters = {
      userId: null,
      action: '',
      entityType: '',
      startDate: '',
      endDate: ''
    };
    this.currentPage = 1;
    this.loadLogs();
  }

  getActionLabel(action: string): string {
    const option = this.actionOptions.find(opt => opt.value === action);
    return option ? option.label : action;
  }

  getEntityTypeLabel(entityType: string): string {
    const option = this.entityTypeOptions.find(opt => opt.value === entityType);
    return option ? option.label : entityType;
  }

  getActionClass(action: string): string {
    switch (action) {
      case 'create':
        return 'badge bg-success';
      case 'update':
        return 'badge bg-primary';
      case 'delete':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getEntityTypeClass(entityType: string): string {
    switch (entityType) {
      case 'user':
        return 'badge bg-purple';
      case 'service':
        return 'badge bg-warning';
      case 'reservation':
        return 'badge bg-info';
      case 'room':
        return 'badge bg-pink';
      default:
        return 'badge bg-secondary';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
} 