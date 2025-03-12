import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  registrationDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private clients: Client[] = [
    { id: 1, firstName: 'Carlos', lastName: 'López', phone: '123456789', email: 'carlos@example.com', registrationDate: '2025-03-01' },
    { id: 2, firstName: 'Marta', lastName: 'Gómez', phone: '987654321', email: 'marta@example.com', registrationDate: '2025-03-02' }
  ];

  private clientSubject = new BehaviorSubject<Client[]>(this.clients);

  getClients(): Observable<Client[]> {
    return this.clientSubject.asObservable();
  }

  addClient(client: Client) {
    client.id = this.clients.length + 1;
    this.clients.push(client);
    this.clientSubject.next(this.clients);
  }

  updateClient(updatedClient: Client) {
    const index = this.clients.findIndex(c => c.id === updatedClient.id);
    if (index > -1) {
      this.clients[index] = updatedClient;
      this.clientSubject.next(this.clients);
    }
  }

  deleteClient(id: number) {
    this.clients = this.clients.filter(c => c.id !== id);
    this.clientSubject.next(this.clients);
  }
}