import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../services/user.service'; // Adjusted path
import { User } from '../../../../models/api.model'; // Adjusted path

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId?: number;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(6)], // Required only for new users
      role: ['USER', Validators.required] // Default role
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    if (this.userId) {
      this.isEditMode = true;
      this.userForm.get('password')?.clearValidators(); // Password not required for edit unless changing
      this.userForm.get('password')?.updateValueAndValidity();
      this.loadUserData(this.userId);
    }
  }

  loadUserData(id: number): void {
    this.userService.getUserById(id).subscribe(user => {
      this.userForm.patchValue(user);
      // If you don't want to show the password field prefilled or make it optional during edit:
      // const { password, ...userData } = user;
      // this.userForm.patchValue(userData);
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched(); // Mark fields as touched to show errors
      return;
    }

    const userData = this.userForm.value;

    if (this.isEditMode && this.userId) {
      // If password field is empty during edit, don't send it to update
      if (!userData.password) {
        delete userData.password;
      }
      this.userService.updateUser(this.userId, userData).subscribe(() => {
        // TODO: Add success toast/notification
        this.router.navigate(['/dashboard/users']);
      });
    } else {
        if (!this.userForm.get('password')?.value) {
            this.userForm.get('password')?.setValidators(Validators.required);
            this.userForm.get('password')?.updateValueAndValidity();
            this.userForm.markAllAsTouched();
            return;
        }
      this.userService.register(userData).subscribe(() => {
        // TODO: Add success toast/notification
        this.router.navigate(['/dashboard/users']);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users']);
  }

  // Helper getters for template validation
  get name() { return this.userForm.get('name'); }
  get surname() { return this.userForm.get('surname'); }
  get email() { return this.userForm.get('email'); }
  get password() { return this.userForm.get('password'); }
  get role() { return this.userForm.get('role'); }
} 