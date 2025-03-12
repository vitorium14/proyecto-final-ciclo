import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../services/client.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-form',
  imports:[ReactiveFormsModule,CommonModule],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit, OnChanges {
  @Input() clientData: Client | null = null;
  @Output() saveClient = new EventEmitter<Client>();

  clientForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  // Se ejecuta cada vez que cambian las @Input
  ngOnChanges(changes: SimpleChanges) {
    if (changes['clientData']) {
      this.initForm(); // Reinicializa el formulario con los nuevos datos
    }
  }

  initForm() {
    this.clientForm = this.fb.group({
      id: [this.clientData?.id || 0],
      firstName: [this.clientData?.firstName || '', Validators.required],
      lastName: [this.clientData?.lastName || '', Validators.required],
      phone: [this.clientData?.phone || '', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      email: [this.clientData?.email || '', [Validators.required, Validators.email]],
      registrationDate: [this.clientData?.registrationDate || new Date().toISOString().split('T')[0]]
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.saveClient.emit(this.clientForm.value);
    }
  }
}