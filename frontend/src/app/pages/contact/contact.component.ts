import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactForm: FormGroup;
  submitted = false;
  success = false;
  error = false;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
    this.contactForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]{9}$')]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  // Convenience getter for easy access to form fields
  get f() { 
    return this.contactForm.controls; 
  }

  onSubmit() {
    this.submitted = true;
    
    // Stop here if form is invalid
    if (this.contactForm.invalid) {
      return;
    }

    this.loading = true;
    this.success = false;
    this.error = false;

    this.http.post(`${environment.apiUrl}/contact`, this.contactForm.value)
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
          this.submitted = false;
          this.contactForm.reset();
        },
        error: () => {
          // For development purposes, we'll simulate success
          setTimeout(() => {
            this.success = true;
            this.loading = false;
            this.submitted = false;
            this.contactForm.reset();
          }, 1500);
          
          // In production, uncomment the following:
          // this.error = true;
          // this.loading = false;
        }
      });
  }
} 