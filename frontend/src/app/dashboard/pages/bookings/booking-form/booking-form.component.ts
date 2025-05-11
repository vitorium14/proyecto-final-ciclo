import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../../../services/booking.service';
import { RoomService } from '../../../../services/room.service';
import { UserService } from '../../../../services/user.service';
import { ServiceService } from '../../../../services/service.service';
import { 
    Booking, 
    BookingCreationPayload, 
    BookingUpdatePayload,
    Room,
    User,
    Service as ApiService
} from '../../../../models/api.model';

@Component({
    selector: 'app-booking-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './booking-form.component.html',
    styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
    bookingForm!: FormGroup;
    isEditMode = false;
    bookingId?: number;
    
    // Options for select fields
    availableRooms: Room[] = [];
    users: User[] = [];
    services: ApiService[] = [];
    
    // For displaying selected services
    selectedServices: ApiService[] = [];
    
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private bookingService = inject(BookingService);
    private roomService = inject(RoomService);
    private userService = inject(UserService);
    private serviceService = inject(ServiceService);

    ngOnInit(): void {
        this.initForm();
        this.loadUsers();
        this.loadServices();
        
        this.bookingId = +this.route.snapshot.paramMap.get('id')!;
        if (this.bookingId) {
            this.isEditMode = true;
            this.loadBookingData();
        }
        
        // Watch for date changes to update available rooms
        this.bookingForm.get('checkIn')?.valueChanges.subscribe(() => this.updateAvailableRooms());
        this.bookingForm.get('checkOut')?.valueChanges.subscribe(() => this.updateAvailableRooms());
    }

    private initForm(): void {
        this.bookingForm = this.fb.group({
            user: ['', Validators.required],
            room: ['', Validators.required],
            checkIn: ['', Validators.required],
            checkOut: ['', Validators.required],
            services: [[]],
            checkedIn: [false],
            checkedOut: [false]
        });
    }

    private loadBookingData(): void {
        if (!this.bookingId) return;
        
        this.bookingService.getBookingById(this.bookingId).subscribe({
            next: (booking) => {
                // Format dates for input fields (YYYY-MM-DDThh:mm)
                const checkIn = new Date(booking.checkIn);
                const checkOut = new Date(booking.checkOut);
                
                this.bookingForm.patchValue({
                    user: booking.user.id,
                    room: booking.room.id,
                    checkIn: this.formatDateForInput(checkIn),
                    checkOut: this.formatDateForInput(checkOut),
                    services: booking.services.map(s => s.id),
                    checkedIn: booking.checkedIn,
                    checkedOut: booking.checkedOut
                });
                
                // Store selected services for display
                this.selectedServices = booking.services;
                
                // Load available rooms including the currently assigned room
                this.updateAvailableRooms(booking.room);
            },
            error: (err) => {
                console.error('Error loading booking:', err);
                this.router.navigate(['/dashboard/bookings']);
            }
        });
    }
    
    private formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    private loadUsers(): void {
        this.userService.getAllUsers().subscribe({
            next: (users) => {
                this.users = users;
            },
            error: (err) => {
                console.error('Error loading users:', err);
            }
        });
    }

    private loadServices(): void {
        this.serviceService.getAllServices().subscribe({
            next: (services) => {
                this.services = services;
            },
            error: (err) => {
                console.error('Error loading services:', err);
            }
        });
    }
    
    private updateAvailableRooms(currentRoom?: Room): void {
        const checkIn = this.bookingForm.get('checkIn')?.value;
        const checkOut = this.bookingForm.get('checkOut')?.value;
        
        if (!checkIn || !checkOut) {
            // Load all rooms if dates not selected yet
            this.roomService.getAllRooms().subscribe({
                next: (rooms) => {
                    this.availableRooms = rooms;
                },
                error: (err) => {
                    console.error('Error loading rooms:', err);
                }
            });
            return;
        }
        
        this.roomService.getAvailableRooms(checkIn, checkOut).subscribe({
            next: (rooms) => {
                this.availableRooms = rooms;
                
                // If in edit mode, add current room to available rooms if not already included
                if (currentRoom && !this.availableRooms.some(r => r.id === currentRoom.id)) {
                    this.availableRooms.push(currentRoom);
                }
            },
            error: (err) => {
                console.error('Error loading available rooms:', err);
            }
        });
    }
    
    toggleService(service: ApiService): void {
        const currentServices = this.bookingForm.get('services')!.value as number[];
        const serviceIndex = currentServices.indexOf(service.id);
        
        if (serviceIndex === -1) {
            // Add service
            currentServices.push(service.id);
            this.selectedServices.push(service);
        } else {
            // Remove service
            currentServices.splice(serviceIndex, 1);
            this.selectedServices = this.selectedServices.filter(s => s.id !== service.id);
        }
        
        this.bookingForm.get('services')!.setValue(currentServices);
    }
    
    isServiceSelected(serviceId: number): boolean {
        const services = this.bookingForm.get('services')!.value as number[];
        return services.includes(serviceId);
    }

    calculateDuration(checkIn: string, checkOut: string): number {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    onSubmit(): void {
        if (this.bookingForm.invalid) {
            return;
        }
        
        const formValues = this.bookingForm.value;
        const duration = this.calculateDuration(formValues.checkIn, formValues.checkOut);
        
        if (this.isEditMode && this.bookingId) {
            const updatePayload: BookingUpdatePayload = {
                user: +formValues.user,
                services: formValues.services,
                checkIn: formValues.checkIn,
                checkOut: formValues.checkOut,
                checkedIn: formValues.checkedIn,
                checkedOut: formValues.checkedOut,
                room: +formValues.room,
                duration: duration
            };
            
            this.bookingService.updateBooking(this.bookingId, updatePayload).subscribe({
                next: () => {
                    this.router.navigate(['/dashboard/bookings']);
                },
                error: (err) => {
                    console.error('Error updating booking:', err);
                }
            });
        } else {
            const createPayload: BookingCreationPayload = {
                user: +formValues.user,
                services: formValues.services,
                checkIn: formValues.checkIn,
                checkOut: formValues.checkOut,
                checkedIn: formValues.checkedIn,
                checkedOut: formValues.checkedOut,
                room: +formValues.room,
                roomType: +this.availableRooms.find(r => r.id === +formValues.room)?.type.id!,
                duration: duration
            };
            
            this.bookingService.createBooking(createPayload).subscribe({
                next: () => {
                    this.router.navigate(['/dashboard/bookings']);
                },
                error: (err) => {
                    console.error('Error creating booking:', err);
                }
            });
        }
    }
} 