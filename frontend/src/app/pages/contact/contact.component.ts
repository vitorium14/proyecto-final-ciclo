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
  
  submitForm() {
    this.formSubmitted = true;
    
    // Check if form is valid (basic validation)
    if (this.contactForm.name && this.contactForm.email && this.contactForm.message) {
      // In a real application, you would send this data to an API endpoint
      console.log('Form submitted:', this.contactForm);
      
      // Simulate success
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
    } else {
      // Form validation failed
      this.formSuccess = false;
      this.formError = true;
    }
  }
}
