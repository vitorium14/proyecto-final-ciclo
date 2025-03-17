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
      id: [this.roomData?.id||''],
      number: [this.roomData?.number || 0, Validators.required],
      type: [this.roomData?.type || 'X', Validators.required],
      price: [this.roomData?.price || 100, [Validators.required, Validators.min(1)]],
      status: [this.roomData?.status || 'avaiable', Validators.required],
      capacity: [this.roomData?.capacity, Validators.required],
      description: [this.roomData?.description, Validators.required]
    });
  }

  onSubmit() {
    if (this.roomForm.valid) {
      this.saveRoom.emit(this.roomForm.value);
      this.roomForm.reset()
    }
  }
}