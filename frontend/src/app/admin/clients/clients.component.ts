import { Component, OnInit } from '@angular/core';
import { ClientService, Client } from '../../services/client.service';
import {Modal} from 'bootstrap'
import { ClientFormComponent } from '../../shared/client-form/client-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clients',
  imports:[ClientFormComponent,CommonModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  selectedClient: Client | null = null;
  modal: any;

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    
  }

  openModal(client: Client | null) {
  }

  onSaveClient(client: Client) {
  }

  deleteClient(id: number) {
  }
}