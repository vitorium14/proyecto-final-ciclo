import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  constructor(private toastService: ToastService) {}
  currentYear: number = new Date().getFullYear();

  newsletterForm: FormGroup = new FormGroup({
    email: new FormControl('')
  });

  
  // Manejar suscripción al newsletter
  subscribeNewsletter(email: string): void {
    // Aquí se implementaría la lógica real para suscribir al usuario al newsletter
    console.log(email);
    this.toastService.success('¡Gracias por suscribirte a nuestro newsletter!');
  }
}
