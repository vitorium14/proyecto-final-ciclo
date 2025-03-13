import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Room, RoomService } from '../../services/room.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  featuredRooms: Room[] = [];

  constructor(private roomService: RoomService, private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.roomService.getRooms().subscribe(rooms => {
      this.featuredRooms = rooms.slice(0, 3); // Mostrar solo las primeras 3 habitaciones
    });
  }

  viewRoom(id: number) {
    this.router.navigate(['/room', id]);
  }
  
}