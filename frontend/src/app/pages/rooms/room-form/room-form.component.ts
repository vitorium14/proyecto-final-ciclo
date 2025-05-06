import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Room, RoomStatus, RoomType } from '../../../models/room.model';
import { RoomService } from '../../../services/room.service';
import { NgIf, NgFor, NgClass, CurrencyPipe } from '@angular/common';
import { switchMap, of, catchError } from 'rxjs';

interface RoomFormData {
  number: string;
  roomType: string | RoomType;
  status?: RoomStatus;
}

@Component({
  selector: 'app-room-form',
  templateUrl: './room-form.component.html',
  styleUrls: ['./room-form.component.css'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ReactiveFormsModule, RouterLink, CurrencyPipe]
})
export class RoomFormComponent implements OnInit {
  roomForm: FormGroup;
  roomTypes: RoomType[] = [];
  isEditMode = false;
  roomId: number | null = null;
  isSubmitting = false;
  error: string | null = null;
  roomStatusEnum = RoomStatus;
  roomStatusOptions = [
    { value: RoomStatus.AVAILABLE, label: 'Disponible' },
    { value: RoomStatus.OCCUPIED, label: 'Ocupada' },
    { value: RoomStatus.CLEANING, label: 'En limpieza' },
    { value: RoomStatus.MAINTENANCE, label: 'En mantenimiento' }
  ];

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.roomForm = this.createRoomForm();
  }

  ngOnInit(): void {
    this.loadRoomTypes();

    // Check if we're in edit mode
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id && id !== 'new') {
          this.isEditMode = true;
          this.roomId = +id;
          return this.roomService.getRoom(+id);
        }
        return of(null);
      }),
      catchError(error => {
        console.error('Error fetching room', error);
        this.error = 'Error al cargar la habitación';
        return of(null);
      })
    ).subscribe(room => {
      if (room) {
        this.updateFormWithRoomData(room);
      }
    });
  }

  createRoomForm(): FormGroup {
    return this.fb.group({
      number: ['', [Validators.required, Validators.maxLength(50)]],
      roomTypeId: ['', Validators.required],
      status: [RoomStatus.AVAILABLE, Validators.required]
    });
  }

  updateFormWithRoomData(room: Room): void {
    this.roomForm.patchValue({
      number: room.number,
      roomTypeId: room.roomType.id,
      status: room.status || RoomStatus.AVAILABLE
    });
  }

  loadRoomTypes(): void {
    this.roomService.getRoomTypes().subscribe({
      next: (response) => {
        this.roomTypes = response.room_types;
      },
      error: (err) => {
        console.error('Error fetching room types', err);
        this.error = 'Error al cargar los tipos de habitaciones';
      }
    });
  }

  onSubmit(): void {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const roomData: RoomFormData = {
      number: this.roomForm.value.number,
      roomType: `/api/room_types/${this.roomForm.value.roomTypeId}`, // IRI format for API Platform
      status: this.roomForm.value.status
    };

    const request = this.isEditMode && this.roomId
      ? this.roomService.updateRoom(this.roomId, roomData as any)
      : this.roomService.createRoom(roomData as any);

    request.subscribe({
      next: () => {
        this.router.navigate(['/dashboard/rooms']);
      },
      error: (error) => {
        console.error('Error saving room', error);
        this.error = 'Error al guardar la habitación';
        this.isSubmitting = false;
      }
    });
  }
}
