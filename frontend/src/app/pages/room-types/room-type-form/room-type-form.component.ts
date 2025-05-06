import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RoomService } from '../../../services/room.service';
import { RoomType, Image } from '../../../models/room.model';

@Component({
  selector: 'app-room-type-form',
  templateUrl: './room-type-form.component.html',
  styleUrls: ['./room-type-form.component.css'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ReactiveFormsModule, RouterLink]
})
export class RoomTypeFormComponent implements OnInit {
  roomTypeForm: FormGroup;
  isEditMode: boolean = false;
  roomTypeId: number | null = null;
  isSubmitting: boolean = false;
  error: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.roomTypeForm = this.createForm();
  }

  ngOnInit(): void {
    this.roomTypeId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !isNaN(this.roomTypeId) && this.roomTypeId > 0;
    
    if (this.isEditMode && this.roomTypeId) {
      this.loadRoomType(this.roomTypeId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      price: ['', [Validators.required, Validators.min(0)]],
      amenities: [''],
      images: this.fb.array([])
    });
  }

  private loadRoomType(id: number): void {
    this.roomService.getRoomType(id).subscribe({
      next: (roomType: RoomType) => {
        this.roomTypeForm.patchValue({
          name: roomType.name,
          price: roomType.price,
          amenities: roomType.amenities || ''
        });
        
        // Add any existing images to the form array
        if (roomType.images && roomType.images.length > 0) {
          const imagesArray = this.roomTypeForm.get('images') as FormArray;
          
          roomType.images.forEach(image => {
            imagesArray.push(this.fb.group({
              id: [image.id],
              image: [image.path],
              isNew: [false]
            }));
          });
        }
      },
      error: (err) => {
        console.error('Error loading room type', err);
        this.error = 'Error al cargar el tipo de habitación';
      }
    });
  }

  get imagesArray(): FormArray {
    return this.roomTypeForm.get('images') as FormArray;
  }

  addImage(): void {
    this.imagesArray.push(this.fb.group({
      image: ['', Validators.required],
      isNew: [true]
    }));
  }

  removeImage(index: number): void {
    this.imagesArray.removeAt(index);
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Comprobar tipo de archivo
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        this.error = 'Solo se permiten archivos de imagen (JPEG, PNG, GIF)';
        return;
      }
      
      // Comprobar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.error = 'El tamaño máximo permitido es 2MB';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          const base64String = e.target.result.toString();
          // Actualizar el formulario con la imagen en base64
          const imageGroup = this.imagesArray.at(index) as FormGroup;
          imageGroup.patchValue({
            image: base64String,
            isNew: true
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.roomTypeForm.invalid) {
      this.roomTypeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const roomTypeData = this.roomTypeForm.value;
    
    // Formatear el valor de las imágenes para la API
    if (roomTypeData.images && roomTypeData.images.length > 0) {
      roomTypeData.images = roomTypeData.images.map((img: any) => ({
        id: img.id || null,
        image: img.image, // Este es el string base64
        isNew: img.isNew
      }));
    }
    
    if (this.isEditMode && this.roomTypeId) {
      this.roomService.updateRoomType(this.roomTypeId, roomTypeData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/room-types']);
        },
        error: (err) => {
          console.error('Error updating room type', err);
          this.error = 'Error al actualizar el tipo de habitación';
          this.isSubmitting = false;
        }
      });
    } else {
      this.roomService.createRoomType(roomTypeData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/room-types']);
        },
        error: (err) => {
          console.error('Error creating room type', err);
          this.error = 'Error al crear el tipo de habitación';
          this.isSubmitting = false;
        }
      });
    }
  }
} 