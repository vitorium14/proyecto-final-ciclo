import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'; // Import NgbModal
import { finalize } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model'; // Import User model

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'] // Use styleUrls
})
export class UserManagementComponent implements OnInit {
  // State
  isLoading = false;
  error: string | null = null;
  isSubmitting = false;

  // Data
  users: User[] = [];
  filteredUsers: User[] = [];
  totalUsers = 0;

  // Filtering
  searchTerm = '';
  filterRole = ''; // e.g., 'ROLE_USER', 'ROLE_EMPLOYEE', 'ROLE_ADMIN'

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Modals
  // For simplicity, using selectedUser for edit/delete. Add might need a separate form/object.
  selectedUser: User | null = null; // Use User type or null
  private activeModal: NgbModalRef | null = null;

  constructor(
    private userService: UserService,
    private modalService: NgbModal // Inject NgbModal
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    this.userService.getUsers()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.users = data;
          this.applyFilters(); // Apply filters after loading
        },
        error: (err) => {
          this.error = err.message || 'Failed to load users.';
          console.error('Error loading users:', err);
          this.users = [];
          this.applyFilters();
        }
      });
  }

  // Filtering Methods
  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm ||
                           user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) || // Changed to fullName
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.filterRole || user.roles.includes(this.filterRole);

      return matchesSearch && matchesRole;
    });

    this.totalUsers = this.filteredUsers.length;
    this.calculateTotalPages();
    this.currentPage = 1; // Reset to first page on filter change
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterRole = '';
    this.applyFilters();
  }

  // Pagination Methods
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageArray(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  }

  // Modal Methods
  openEditUserModal(content: TemplateRef<any>, user: User): void {
    this.selectedUser = { ...user }; // Create a copy for editing
    this.activeModal = this.modalService.open(content, { ariaLabelledBy: 'modal-edit-user-title', centered: true });
  }

  openDeleteUserModal(content: TemplateRef<any>, user: User): void {
    this.selectedUser = user; // Direct reference is okay for delete confirmation
    this.activeModal = this.modalService.open(content, { ariaLabelledBy: 'modal-delete-user-title', centered: true, size: 'sm' });
  }

  // TODO: Implement openAddUserModal if needed (might involve a separate component/form)
  // openAddUserModal(content: TemplateRef<any>): void {
  //   // Initialize a new user object or form model
  //   this.activeModal = this.modalService.open(content, { ariaLabelledBy: 'modal-add-user-title', centered: true });
  // }

  // CRUD Methods
  // TODO: Implement addUser if needed
  // addUser(): void { ... }

  updateUser(): void {
    if (!this.selectedUser || !this.selectedUser.id) {
      console.error('Cannot update user without a selected user ID.');
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // Prepare data - only send fields that can be updated by admin
    // Example: updating roles or fullName. Avoid sending password here.
    const userData: Partial<User> = {
      fullName: this.selectedUser.fullName, // Changed to fullName
      email: this.selectedUser.email, // Be cautious if email update requires verification
      roles: this.selectedUser.roles
      // Add other updatable fields as needed
    };

    this.userService.updateUser(this.selectedUser.id, userData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.applyFilters();
          }
          this.activeModal?.close('User updated');
          console.log('User updated successfully:', updatedUser);
          // Add success notification
        },
        error: (err) => {
          this.error = err.message || 'Error al actualizar el usuario.';
          console.error('Error updating user:', err);
          // Add error notification
        }
      });
  }

  deleteUser(): void {
    if (!this.selectedUser || !this.selectedUser.id) {
      console.error('Cannot delete user without a selected user ID.');
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    const userIdToDelete = this.selectedUser.id;

    this.userService.deleteUser(userIdToDelete)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userIdToDelete);
          this.applyFilters();
          this.activeModal?.close('User deleted');
          console.log('User deleted successfully:', userIdToDelete);
          // Add success notification
        },
        error: (err) => {
          this.error = err.message || 'Error al eliminar el usuario.';
          console.error('Error deleting user:', err);
          // Add error notification
        }
      });
  }

  // Utility
  getRolesAsString(roles: string[]): string {
    return roles.map(role => role.replace('ROLE_', '')).join(', '); // Simple display
  }
}