import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Estadísticas generales
  currentDate = new Date();
  totalReservations = 187;
  totalRevenue = 52680;
  occupancyRate = 72;
  newUsers = 45;
  
  // Datos para reservaciones recientes
  recentReservations = [
    {
      id: 1,
      guestName: 'María García',
      status: 'Confirmada',
      checkIn: new Date('2025-05-10'),
      checkOut: new Date('2025-05-15'),
      roomType: 'Deluxe',
      roomNumber: '301'
    },
    {
      id: 2,
      guestName: 'Juan Pérez',
      status: 'Check-in',
      checkIn: new Date('2025-05-05'),
      checkOut: new Date('2025-05-08'),
      roomType: 'Suite',
      roomNumber: '401'
    },
    {
      id: 3,
      guestName: 'Carlos Martínez',
      status: 'Pendiente',
      checkIn: new Date('2025-05-20'),
      checkOut: new Date('2025-05-25'),
      roomType: 'Estándar',
      roomNumber: '205'
    },
    {
      id: 4,
      guestName: 'Laura Sánchez',
      status: 'Confirmada',
      checkIn: new Date('2025-05-18'),
      checkOut: new Date('2025-05-22'),
      roomType: 'Deluxe',
      roomNumber: '310'
    }
  ];
  
  constructor() {}
  
  ngOnInit() {
    // Aquí se podrían cargar datos reales desde un servicio
    this.loadDashboardData();
  }
  
  loadDashboardData() {
    // Método para cargar datos desde servicios REST
    // Por ahora usamos datos simulados
  }
}