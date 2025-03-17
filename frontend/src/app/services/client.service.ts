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

}