import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Room } from '../../services/room.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './room-form.component.html',
  styleUrls: ['./room-form.component.css']
})
export class RoomFormComponent implements OnInit, OnChanges {
  @Input() roomData: Room | null = null;
  @Output() saveRoom = new EventEmitter<Room>();

  roomForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['roomData']) {
      this.initForm();
    }
  }

  initForm() {
    this.roomForm = this.fb.group({
      id: [this.roomData?.id || 0],
      roomNumber: [this.roomData?.roomNumber || '', Validators.required],
      type: [this.roomData?.type || '', Validators.required],
      pricePerNight: [this.roomData?.pricePerNight || 0, [Validators.required, Validators.min(1)]],
      isAvailable: [this.roomData?.isAvailable || false]
    });
  }

  onSubmit() {
    if (this.roomForm.valid) {
      this.saveRoom.emit(this.roomForm.value);
      this.roomForm.reset()
    }
  }
}