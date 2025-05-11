import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  
  formSubmitted = false;
  formSuccess = false;
  formError = false;
  loading = false;
  
  submitForm(): void {
    this.formSubmitted = true;
    
    // Check if form is valid (basic validation)
    if (this.contactForm.name && this.contactForm.email && this.contactForm.message) {
      this.loading = true;
      
      // Simulamos el envío del formulario
      setTimeout(() => {
        this.loading = false;
        this.formSuccess = true;
        this.formError = false;
        
        // Reset form
        this.contactForm = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
        this.formSubmitted = false;
        
        // Ocultar el mensaje de éxito después de 5 segundos
        setTimeout(() => {
          this.formSuccess = false;
        }, 5000);
      }, 1500);
    } else {
      // Form validation failed
      this.formSuccess = false;
      this.formError = true;
    }
  }
}
