import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogService } from '../../../services/log.service';
import { LogStats } from '../../../models/log.model';

@Component({
  selector: 'app-log-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './log-dashboard.component.html',
  styles: [`
    /* Custom styles for log dashboard can go here if needed */
  `]
})
export class LogDashboardComponent implements OnInit {
  stats: LogStats | null = null;
  loading = true;
  error = '';

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.logService.getLogStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar estadísticas';
        this.loading = false;
        console.error('Error loading log stats', err);
      }
    });
  }

  getColorForAction(action: string): string {
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

  getColorForEntityType(entityType: string): string {
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
} 