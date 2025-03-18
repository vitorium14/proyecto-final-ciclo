import { Component } from '@angular/core';
import { ClientService, Client } from '../../services/client.service';
import { ClientFormComponent } from '../../shared/client-form/client-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clients',
  imports: [ClientFormComponent, CommonModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
})
export class ClientsComponent {
  clients: Client[] = [];
  selectedClient: Client | null = null;

  constructor(private clientService: ClientService) {}
}
