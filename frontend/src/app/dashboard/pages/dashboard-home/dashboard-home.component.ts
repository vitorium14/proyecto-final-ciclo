import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardCardComponent } from '../../shared/dashboard-card/dashboard-card.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, DashboardCardComponent, RouterModule],
  template: `
    <div class="page-header">
      <h1>Dashboard Overview</h1>
      <div class="page-actions">
        <button class="btn btn-primary">
          <i class="bi bi-plus-lg"></i>
          <span>New Booking</span>
        </button>
      </div>
    </div>
    
    <!-- Dashboard Cards -->
    <div class="row">
      <div class="col-md-6 col-lg-3 mb-4">
        <app-dashboard-card
          icon="bi-calendar-check-fill"
          [count]="24"
          label="Active Bookings"
          cardType="primary"
          footerText="This month"
          routerLink="/dashboard/bookings"
          linkText="View Bookings">
        </app-dashboard-card>
      </div>
      
      <div class="col-md-6 col-lg-3 mb-4">
        <app-dashboard-card
          icon="bi-people-fill"
          [count]="120"
          label="Registered Users"
          cardType="secondary"
          footerText="Total users"
          routerLink="/dashboard/users"
          linkText="Manage Users">
        </app-dashboard-card>
      </div>
      
      <div class="col-md-6 col-lg-3 mb-4">
        <app-dashboard-card
          icon="bi-key-fill"
          [count]="42"
          label="Available Rooms"
          cardType="success"
          footerText="Out of 50"
          routerLink="/dashboard/rooms"
          linkText="View Rooms">
        </app-dashboard-card>
      </div>
      
      <div class="col-md-6 col-lg-3 mb-4">
        <app-dashboard-card
          icon="bi-gear-fill"
          [count]="8"
          label="Active Services"
          cardType="primary"
          footerText="Available services"
          routerLink="/dashboard/services"
          linkText="View Services">
        </app-dashboard-card>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="row">
      <div class="col-lg-8 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5>Recent Bookings</h5>
            <a routerLink="/dashboard/bookings" class="btn btn-sm btn-primary">View All</a>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Room</th>
                    <th>Check In</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let booking of recentBookings">
                    <td>#{{ booking.id }}</td>
                    <td>{{ booking.customer }}</td>
                    <td>{{ booking.room }}</td>
                    <td>{{ booking.checkIn }}</td>
                    <td>
                      <span class="status-badge" [ngClass]="'status-' + booking.status.toLowerCase()">
                        <i class="bi" [ngClass]="getStatusIcon(booking.status)"></i>
                        {{ booking.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5>Notifications</h5>
          </div>
          <div class="card-body p-0">
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex p-3 border-bottom" *ngFor="let notification of notifications">
                <div class="me-3">
                  <div class="avatar bg-light rounded-circle p-2">
                    <i class="bi" [ngClass]="notification.icon"></i>
                  </div>
                </div>
                <div>
                  <h6 class="mb-1">{{ notification.title }}</h6>
                  <p class="text-muted small mb-0">{{ notification.time }}</p>
                </div>
              </li>
            </ul>
          </div>
          <div class="card-footer">
            <a href="#" class="btn btn-sm btn-secondary w-100">View All Notifications</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--neutral-100);
    }
    
    .avatar i {
      font-size: 1.2rem;
      color: var(--primary-orange);
    }
    
    .list-group-item {
      transition: background-color var(--transition-fast);
    }
    
    .list-group-item:hover {
      background-color: var(--neutral-50);
    }
  `]
})
export class DashboardHomeComponent implements OnInit {
  recentBookings = [
    { id: 1025, customer: 'John Smith', room: 'Deluxe Suite', checkIn: '2023-07-15', status: 'Active' },
    { id: 1024, customer: 'Sarah Johnson', room: 'Standard Room', checkIn: '2023-07-14', status: 'Pending' },
    { id: 1023, customer: 'Michael Brown', room: 'Premium Suite', checkIn: '2023-07-12', status: 'Active' },
    { id: 1022, customer: 'Emily Davis', room: 'Deluxe Room', checkIn: '2023-07-10', status: 'Inactive' },
    { id: 1021, customer: 'David Wilson', room: 'Standard Suite', checkIn: '2023-07-08', status: 'Active' }
  ];
  
  notifications = [
    { icon: 'bi-calendar-check', title: 'New booking (#1025) confirmed', time: '10 minutes ago' },
    { icon: 'bi-person-plus', title: 'New user registered', time: '1 hour ago' },
    { icon: 'bi-star-fill', title: 'New review received (4.5 stars)', time: '3 hours ago' },
    { icon: 'bi-exclamation-triangle', title: 'Room #105 needs maintenance', time: '5 hours ago' }
  ];
  
  ngOnInit(): void {
    // Animation for sequential loading of elements
    setTimeout(() => {
      const cards = document.querySelectorAll('.dashboard-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('fade-in');
        }, index * 100);
      });
    }, 100);
  }
  
  getStatusIcon(status: string): string {
    switch(status.toLowerCase()) {
      case 'active': return 'bi-check-circle-fill';
      case 'pending': return 'bi-hourglass-split';
      case 'inactive': return 'bi-x-circle-fill';
      default: return 'bi-circle-fill';
    }
  }
} 