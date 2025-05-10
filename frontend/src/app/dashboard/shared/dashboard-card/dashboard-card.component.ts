import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card dashboard-card h-100 fade-in" [ngClass]="cardType">
      <div class="card-body">
        <div class="icon">
          <i class="bi" [ngClass]="icon"></i>
        </div>
        <div class="counter">{{ count }}</div>
        <div class="label">{{ label }}</div>
      </div>
      <div class="card-footer" *ngIf="footerText || routerLink">
        <div class="d-flex justify-content-between align-items-center">
          <span *ngIf="footerText">{{ footerText }}</span>
          <a *ngIf="routerLink" [routerLink]="routerLink" class="btn btn-sm" 
             [ngClass]="{'btn-primary': cardType === 'primary',
                         'btn-secondary': cardType === 'secondary',
                         'btn-success': cardType === 'success',
                         'btn-danger': cardType === 'danger'}">
            <span>{{ linkText }}</span>
            <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-card {
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    }
    
    .dashboard-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-hover);
    }
    
    .dashboard-card .btn i {
      margin-left: 5px;
      margin-right: 0;
    }
    
    .dashboard-card .counter {
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .dashboard-card.secondary .counter {
      background: var(--gradient-accent);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .dashboard-card.success .counter {
      color: var(--success-color);
      -webkit-text-fill-color: initial;
    }
    
    .dashboard-card.danger .counter {
      color: var(--error-color);
      -webkit-text-fill-color: initial;
    }
  `]
})
export class DashboardCardComponent {
  @Input() icon = 'bi-star-fill';
  @Input() count = 0;
  @Input() label = 'Items';
  @Input() cardType: 'primary' | 'secondary' | 'success' | 'danger' = 'primary';
  @Input() footerText = '';
  @Input() routerLink: string | null = null;
  @Input() linkText = 'View All';
} 