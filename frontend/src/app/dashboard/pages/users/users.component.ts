import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../../../models/api.model';
import { UserService } from '../../../services/user.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
    users: User[] = [];
    private userService = inject(UserService);

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.userService.getAllUsers().subscribe({
            next: (data) => {
                this.users = data;
            },
            error: (err) => {
                console.error('Error fetching users:', err);
                // TODO: Implement user-friendly error handling (e.g., show a toast message)
            }
        });
    }

    deleteUser(userId: number): void {
        // TODO: Add confirmation dialog before deleting
        this.userService.deleteUser(userId).subscribe({
            next: () => {
                this.users = this.users.filter(user => user.id !== userId);
                // TODO: Show success message (e.g., toast)
            },
            error: (err) => {
                console.error('Error deleting user:', err);
                // TODO: Implement user-friendly error handling
            }
        });
    }
} 