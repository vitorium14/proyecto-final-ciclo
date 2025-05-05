import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Datos para la sección de características/servicios
  features = [
    {
      title: 'Desayuno Premium',
      description: 'Disfruta de un completo desayuno buffet con productos locales y opciones para todos los gustos.',
      img: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdGVsJTIwYnJlYWtmYXN0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      icon: 'bi-cup-hot'
    },
    {
      title: 'Wi-Fi Ultrarrápido',
      description: 'Conexión de alta velocidad en todas las instalaciones, ideal para trabajo, streaming o videollamadas.',
      img: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdGVsJTIwd2lmaXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      icon: 'bi-wifi'
    },
    {
      title: 'Ubicación Privilegiada',
      description: 'En pleno centro de la ciudad, a minutos caminando de los principales puntos de interés turístico y comercial.',
      img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2l0eXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      icon: 'bi-geo-alt'
    },
    {
      title: 'Spa & Wellness',
      description: 'Relájate en nuestro spa con tratamientos exclusivos, sauna, jacuzzi y masajes profesionales.',
      img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8c3BhJTIwaG90ZWx8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
      icon: 'bi-water'
    },
    {
      title: 'Restaurante Gourmet',
      description: 'Gastronomía local e internacional con los mejores ingredientes y una cuidada selección de vinos.',
      img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      icon: 'bi-cup-straw'
    },
    {
      title: 'Servicio 24/7',
      description: 'Personal disponible las 24 horas para atender cualquier necesidad durante tu estancia.',
      img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8aG90ZWwlMjByZWNlcHRpb258ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
      icon: 'bi-clock'
    }
  ];

  // Datos para la sección de testimonios
  testimonials = [
    {
      name: 'María García',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      rating: 5,
      date: 'Marzo 2025',
      comment: 'Una experiencia inolvidable. El personal fue extremadamente atento y las instalaciones son maravillosas. La habitación superó todas mis expectativas.'
    },
    {
      name: 'Carlos Rodríguez',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 5,
      date: 'Febrero 2025',
      comment: 'El hotel tiene una ubicación perfecta y unas vistas impresionantes. El desayuno es excepcional y la cama, la más cómoda en la que he dormido.'
    },
    {
      name: 'Laura Martínez',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      rating: 4,
      date: 'Abril 2025',
      comment: 'Disfrutamos mucho del spa y el restaurante. Gran relación calidad-precio y un personal que hace todo lo posible por ayudarte.'
    }
  ];
}
