import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  searchTerm = '';
  selectedRole = '';
  roleOptions = [
    { value: '', label: 'Todos los roles' },
    { value: 'ROLE_USER', label: 'Cliente' },
    { value: 'ROLE_EMPLOYEE', label: 'Empleado' },
    { value: 'ROLE_ADMIN', label: 'Administrador' }
  ];
  loading = false;
  error = '';

  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers(this.currentPage, this.itemsPerPage, this.searchTerm, this.selectedRole)
      .subscribe({
        next: (response) => {
          this.users = response.users;
          this.totalItems = response.total;
          this.totalPages = response.pages;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Error al cargar usuarios';
          this.toastService.error(this.error, 'Error');
          this.loading = false;
          console.error('Error loading users', err);
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onRoleChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  getRoleLabel(role: string): string {
    const option = this.roleOptions.find(opt => opt.value === role);
    return option ? option.label : role;
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

  deleteUser(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.toastService.success('Usuario eliminado correctamente', 'Éxito');
          this.loadUsers();
        },
        error: (err) => {
          this.error = err.message || 'Error al eliminar usuario';
          this.toastService.error(this.error, 'Error');
          console.error('Error deleting user', err);
        }
      });
    }
  }
} 