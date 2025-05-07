import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  userId: number = 0;
  loading = false;
  error = '';
  confirmingDelete = false;
  
  roleLabels: Record<string, string> = {
    'ROLE_USER': 'Cliente',
    'ROLE_EMPLOYEE': 'Empleado',
    'ROLE_ADMIN': 'Administrador'
  };

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userId = +idParam;
      this.loadUser();
    } else {
      this.error = 'ID de usuario no proporcionado';
    }
  }

  loadUser(): void {
    this.loading = true;
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar el usuario';
        this.loading = false;
        console.error('Error loading user', err);
      }
    });
  }

  confirmDelete(): void {
    this.confirmingDelete = true;
  }

  cancelDelete(): void {
    this.confirmingDelete = false;
  }

  deleteUser(): void {
    this.loading = true;
    this.userService.deleteUser(this.userId).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/users']);
      },
      error: (err) => {
        this.error = err.message || 'Error al eliminar el usuario';
        this.loading = false;
        this.confirmingDelete = false;
        console.error('Error deleting user', err);
      }
    });
  }

  getRoleLabel(role: string): string {
    return this.roleLabels[role] || role;
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'badge bg-danger';
      case 'ROLE_EMPLOYEE':
        return 'badge bg-primary';
      case 'ROLE_USER':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  }
} 