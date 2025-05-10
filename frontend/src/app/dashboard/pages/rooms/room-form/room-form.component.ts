import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoomService } from '../../../../services/room.service';
import { RoomTypeService } from '../../../../services/room-type.service'; // To fetch room types
import { Room, RoomCreationPayload, RoomUpdatePayload, RoomType } from '../../../../models/api.model';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './room-form.component.html',
  styleUrls: ['./room-form.component.css']
})
export class RoomFormComponent implements OnInit {
  roomForm: FormGroup;
  isEditMode = false;
  roomId?: number;
  roomTypes: RoomType[] = []; // For the RoomType dropdown
  // Suggested statuses - these could also come from a config or API if dynamic
  roomStatuses: string[] = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER'];

  private fb = inject(FormBuilder);
  private roomService = inject(RoomService);
  private roomTypeService = inject(RoomTypeService); // Injected
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.roomForm = this.fb.group({
      name: ['', Validators.required],
      type: [null, Validators.required], // Will store RoomType ID
      status: ['AVAILABLE', Validators.required], // Default status
      observations: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoomTypes(); // Load room types for the dropdown
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.roomId = Number(idParam);
      this.isEditMode = true;
      this.loadRoomData(this.roomId);
    }
  }

  loadRoomTypes(): void {
    this.roomTypeService.getAllRoomTypes().subscribe(types => {
      this.roomTypes = types;
    });
  }

  loadRoomData(id: number): void {
    this.roomService.getRoomById(id).subscribe(room => {
      this.roomForm.patchValue({
        name: room.name,
        type: room.type?.id, // Patch with RoomType ID
        status: room.status,
        observations: room.observations
      });
    });
  }

  onSubmit(): void {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    const formValue = this.roomForm.value;
    const payload: RoomCreationPayload | RoomUpdatePayload = {
      name: formValue.name,
      type: Number(formValue.type), // Ensure type is a number (RoomType ID)
      status: formValue.status,
      observations: formValue.observations
    };

    if (this.isEditMode && this.roomId) {
      this.roomService.updateRoom(this.roomId, payload as RoomUpdatePayload).subscribe(() => {
        this.router.navigate(['/dashboard/rooms']);
      });
    } else {
      this.roomService.createRoom(payload as RoomCreationPayload).subscribe(() => {
        this.router.navigate(['/dashboard/rooms']);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/rooms']);
  }

  get name() { return this.roomForm.get('name'); }
  get type() { return this.roomForm.get('type'); }
  get status() { return this.roomForm.get('status'); }
  get observations() { return this.roomForm.get('observations'); }
} 