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
    this.clientService.getClients().subscribe(data => {
      this.clients = data;
    });
  }

  openModal(client: Client | null) {
    this.selectedClient = client;
    this.modal = new Modal(document.getElementById('clientModal')!);
    this.modal.show();
  }

  onSaveClient(client: Client) {
    if (client.id) {
      this.clientService.updateClient(client);
    } else {
      this.clientService.addClient(client);
    }
    this.modal.hide();
  }

  deleteClient(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.clientService.deleteClient(id);
    }
  }
}