import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoomTypeService } from '../../../../services/room-type.service';
import { RoomType, RoomTypeCreationPayload, RoomTypeUpdatePayload, ImageUploadPayload, Image } from '../../../../models/api.model';

@Component({
  selector: 'app-room-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './room-type-form.component.html',
  styleUrls: ['./room-type-form.component.css']
})
export class RoomTypeFormComponent implements OnInit {
  roomTypeForm: FormGroup;
  isEditMode = false;
  roomTypeId?: number;
  imagesForPayload: ImageUploadPayload[] = [];

  private fb = inject(FormBuilder);
  private roomTypeService = inject(RoomTypeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.roomTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      amenities: [''],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.roomTypeId = Number(idParam);
      this.isEditMode = true;
      this.loadRoomTypeData(this.roomTypeId);
    }
  }

  loadRoomTypeData(id: number): void {
    this.roomTypeService.getRoomTypeById(id).subscribe(roomType => {
      this.roomTypeForm.patchValue({
        name: roomType.name,
        description: roomType.description,
        price: roomType.price,
        capacity: roomType.capacity,
        amenities: roomType.amenities?.join(', ') || ''
      });
      if (roomType.images) {
        this.imagesForPayload = roomType.images.map((img: Image) => ({ image: img.image }));
      }
    });
  }

  onFilesSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      for (let i = 0; i < inputElement.files.length; i++) {
        const file = inputElement.files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagesForPayload.push({ image: e.target.result as string });
        };
        reader.readAsDataURL(file);
      }
      inputElement.value = '';
    }
  }

  removeImage(index: number): void {
    this.imagesForPayload.splice(index, 1);
  }

  onSubmit(): void {
    if (this.roomTypeForm.invalid) {
      this.roomTypeForm.markAllAsTouched();
      return;
    }

    const formValue = this.roomTypeForm.value;
    const amenitiesArray = formValue.amenities ? formValue.amenities.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [];

    if (this.isEditMode && this.roomTypeId) {
      const payload: RoomTypeUpdatePayload = {
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        capacity: formValue.capacity,
        amenities: amenitiesArray,
        images: this.imagesForPayload
      };
      this.roomTypeService.updateRoomType(this.roomTypeId, payload).subscribe(() => {
        this.router.navigate(['/dashboard/room-types']);
      });
    } else {
      const payload: RoomTypeCreationPayload = {
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        capacity: formValue.capacity,
        amenities: amenitiesArray,
        images: this.imagesForPayload
      };
      this.roomTypeService.createRoomType(payload).subscribe(() => {
        this.router.navigate(['/dashboard/room-types']);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/room-types']);
  }

  get name() { return this.roomTypeForm.get('name'); }
  get description() { return this.roomTypeForm.get('description'); }
  get price() { return this.roomTypeForm.get('price'); }
  get capacity() { return this.roomTypeForm.get('capacity'); }
  get amenities() { return this.roomTypeForm.get('amenities'); }
} 