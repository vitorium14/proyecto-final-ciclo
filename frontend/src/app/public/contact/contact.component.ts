import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  name: string = '';
  email: string = '';
  message: string = '';
  isSubmitting: boolean = false; // Optional: Track submission state
  submitSuccess: boolean | null = null; // Optional: Track submission result

  onSubmit() {
    if (this.isSubmitting) {
      return; // Prevent double submission
    }
    this.isSubmitting = true;
    this.submitSuccess = null;

    // Placeholder: Log form data to console
    console.log('Contact Form Submitted:');
    console.log('Name:', this.name);
    console.log('Email:', this.email);
    console.log('Message:', this.message);

    // Simulate API call delay (remove in real implementation)
    setTimeout(() => {
      // In a real app, you would send data to a backend API here.
      // For now, we'll just simulate success.
      this.submitSuccess = true;
      this.isSubmitting = false;

      // Optionally reset the form
      // this.name = '';
      // this.email = '';
      // this.message = '';

      // Or show a success message in the template using submitSuccess flag
    }, 1500);

    // Example error handling (remove in real implementation)
    // setTimeout(() => {
    //   this.submitSuccess = false;
    //   this.isSubmitting = false;
    //   // Show error message in template
    // }, 2000);
  }
}
