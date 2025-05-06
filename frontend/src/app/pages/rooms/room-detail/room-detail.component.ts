import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Room, RoomStatus } from '../../../models/room.model';
import { RoomService } from '../../../services/room.service';
import { NgIf, CurrencyPipe, NgClass } from '@angular/common';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.css'],
  standalone: true,
  imports: [NgIf, RouterLink, CurrencyPipe, NgClass]
})
export class RoomDetailComponent implements OnInit {
  room: Room | null = null;
  isLoading = true;
  error: string | null = null;
  
  roomStatusLabels: Record<RoomStatus, string> = {
    [RoomStatus.AVAILABLE]: 'Disponible',
    [RoomStatus.OCCUPIED]: 'Ocupada',
    [RoomStatus.CLEANING]: 'Limpieza',
    [RoomStatus.MAINTENANCE]: 'Mantenimiento'
  };
  
  roomStatusClasses: Record<RoomStatus, string> = {
    [RoomStatus.AVAILABLE]: 'bg-success',
    [RoomStatus.OCCUPIED]: 'bg-danger',
    [RoomStatus.CLEANING]: 'bg-warning',
    [RoomStatus.MAINTENANCE]: 'bg-secondary'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    
    if (!roomId) {
      this.router.navigate(['/dashboard/rooms']);
      return;
    }
    
    this.loadRoom(+roomId);
  }

  loadRoom(id: number): void {
    this.isLoading = true;
    this.error = null;
    
    this.roomService.getRoom(id).pipe(
      catchError(error => {
        console.error('Error fetching room details', error);
        this.error = 'Error al cargar los detalles de la habitación';
        this.isLoading = false;
        return EMPTY;
      })
    ).subscribe(room => {
      this.room = room;
      this.isLoading = false;
    });
  }

  getRoomStatusLabel(status?: RoomStatus): string {
    return status ? this.roomStatusLabels[status] : 'Desconocido';
  }

  getRoomStatusClass(status?: RoomStatus): string {
    return status ? this.roomStatusClasses[status] : '';
  }

  deleteRoom(): void {
    if (!this.room) {
      return;
    }
    
    if (confirm('¿Estás seguro de que deseas eliminar esta habitación?')) {
      this.roomService.deleteRoom(this.room.id).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/rooms']);
        },
        error: (error) => {
          console.error('Error deleting room', error);
          this.error = 'Error al eliminar la habitación';
        }
      });
    }
  }
}
