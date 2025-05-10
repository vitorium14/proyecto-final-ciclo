import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceService } from '../../../../services/service.service';
import { Service as ApiService, ServiceCreationPayload, ServiceUpdatePayload, ImageUploadPayload } from '../../../../models/api.model';

@Component({
    selector: 'app-service-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './service-form.component.html',
    styleUrls: ['./service-form.component.css']
})
export class ServiceFormComponent implements OnInit {
    serviceForm!: FormGroup;
    isEditMode = false;
    serviceId?: number;
    selectedImages: string[] = [];
    
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private serviceService = inject(ServiceService);

    ngOnInit(): void {
        this.initForm();
        
        this.serviceId = +this.route.snapshot.paramMap.get('id')!;
        if (this.serviceId) {
            this.isEditMode = true;
            this.loadServiceData();
        }
    }

    private initForm(): void {
        this.serviceForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
            duration: [null],
            images: this.fb.array([])
        });
    }

    private loadServiceData(): void {
        if (!this.serviceId) return;
        
        this.serviceService.getServiceById(this.serviceId).subscribe({
            next: (service) => {
                this.serviceForm.patchValue({
                    name: service.name,
                    description: service.description,
                    price: service.price,
                    duration: service.duration
                });
                
                // Load images
                if (service.images && service.images.length > 0) {
                    service.images.forEach(img => {
                        this.selectedImages.push(img.image);
                    });
                }
            },
            error: (err) => {
                console.error('Error loading service:', err);
                this.router.navigate(['/dashboard/services']);
            }
        });
    }

    get imagesArray(): FormArray {
        return this.serviceForm.get('images') as FormArray;
    }

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            const file = input.files[0];
            const reader = new FileReader();
            
            reader.onload = () => {
                const base64String = reader.result as string;
                this.selectedImages.push(base64String);
                
                // Add to form array
                this.imagesArray.push(this.fb.control(base64String));
            };
            
            reader.readAsDataURL(file);
        }
    }

    removeImage(index: number): void {
        this.selectedImages.splice(index, 1);
        this.imagesArray.removeAt(index);
    }

    onSubmit(): void {
        if (this.serviceForm.invalid) {
            return;
        }
        
        const formValues = this.serviceForm.value;
        const imagePayload: ImageUploadPayload[] = this.selectedImages.map(img => ({ image: img }));
        
        if (this.isEditMode && this.serviceId) {
            const updatePayload: ServiceUpdatePayload = {
                name: formValues.name,
                description: formValues.description,
                price: formValues.price,
                duration: formValues.duration,
                images: imagePayload
            };
            
            this.serviceService.updateService(this.serviceId, updatePayload).subscribe({
                next: () => {
                    this.router.navigate(['/dashboard/services']);
                },
                error: (err) => {
                    console.error('Error updating service:', err);
                }
            });
        } else {
            const createPayload: ServiceCreationPayload = {
                name: formValues.name,
                description: formValues.description,
                price: formValues.price,
                duration: formValues.duration,
                images: imagePayload
            };
            
            this.serviceService.createService(createPayload).subscribe({
                next: () => {
                    this.router.navigate(['/dashboard/services']);
                },
                error: (err) => {
                    console.error('Error creating service:', err);
                }
            });
        }
    }
} 