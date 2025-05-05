import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service'; // Import UserService
// import { User } from '../../models/user.model'; // Import User model later

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  users: any[] = []; // Replace 'any' with User model later
  isLoading = false;
  error: string | null = null;

  // Inject UserService
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    // Call the service to get users
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        // Use the error message provided by the service's error handler
        this.error = err.message || 'Failed to load users.';
        console.error('Error loading users:', err);
        this.isLoading = false;
      }
    });
  }

  // Add methods for editUser, deleteUser, createUser later
}