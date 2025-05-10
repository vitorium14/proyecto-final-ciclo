import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Booking } from '../../../models/api.model';
import { BookingService } from '../../../services/booking.service';

@Component({
    selector: 'app-bookings',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
    bookings: Booking[] = [];
    private bookingService = inject(BookingService);

    ngOnInit(): void {
        this.loadBookings();
    }

    loadBookings(): void {
        this.bookingService.getAllBookings().subscribe({
            next: (data) => {
                this.bookings = data;
            },
            error: (err) => {
                console.error('Error fetching bookings:', err);
                // TODO: Implement user-friendly error handling (e.g., show a toast message)
            }
        });
    }

    toggleCheckedIn(booking: Booking): void {
        const updatedCheckedIn = !booking.checkedIn;
        this.bookingService.updateBooking(booking.id, {
            user: booking.user.id,
            services: booking.services.map(s => s.id),
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            checkedIn: updatedCheckedIn,
            checkedOut: booking.checkedOut,
            room: booking.room.id,
            duration: this.calculateDuration(booking.checkIn, booking.checkOut)
        }).subscribe({
            next: (updatedBooking) => {
                const index = this.bookings.findIndex(b => b.id === booking.id);
                if (index !== -1) {
                    this.bookings[index].checkedIn = updatedCheckedIn;
                }
            },
            error: (err) => {
                console.error('Error updating check-in status:', err);
            }
        });
    }

    toggleCheckedOut(booking: Booking): void {
        const updatedCheckedOut = !booking.checkedOut;
        this.bookingService.updateBooking(booking.id, {
            user: booking.user.id,
            services: booking.services.map(s => s.id),
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            checkedIn: booking.checkedIn,
            checkedOut: updatedCheckedOut,
            room: booking.room.id,
            duration: this.calculateDuration(booking.checkIn, booking.checkOut)
        }).subscribe({
            next: (updatedBooking) => {
                const index = this.bookings.findIndex(b => b.id === booking.id);
                if (index !== -1) {
                    this.bookings[index].checkedOut = updatedCheckedOut;
                }
            },
            error: (err) => {
                console.error('Error updating check-out status:', err);
            }
        });
    }

    deleteBooking(bookingId: number): void {
        // TODO: Add confirmation dialog before deleting
        this.bookingService.deleteBooking(bookingId).subscribe({
            next: () => {
                this.bookings = this.bookings.filter(booking => booking.id !== bookingId);
                // TODO: Show success message (e.g., toast)
            },
            error: (err) => {
                console.error('Error deleting booking:', err);
                // TODO: Implement user-friendly error handling
            }
        });
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleString();
    }

    private calculateDuration(checkIn: string, checkOut: string): number {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
} 