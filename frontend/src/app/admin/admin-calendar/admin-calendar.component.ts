import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReservationService, AdminCalendarReservation } from '../../services/reservation.service';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular'; // Import FullCalendar
import { CalendarOptions, EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core'; // Import CalendarOptions and other types
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!
import esLocale from '@fullcalendar/core/locales/es'; // Import Spanish locale

@Component({
  selector: 'app-admin-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, FullCalendarModule], // Add FullCalendarModule
  templateUrl: './admin-calendar.component.html',
  styleUrl: './admin-calendar.component.scss'
})
export class AdminCalendarComponent implements OnInit, AfterViewInit { // Implement AfterViewInit
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  isLoading: boolean = false;
  errorMessage: string | null = null;
  calendarEvents: EventInput[] = []; // Separate property for events array

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale, // Set locale to Spanish
    firstDay: 1, // Start week on Monday
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek' // Add more views if needed
    },
    weekends: true,
    editable: false, // Set to true if you want to allow drag-and-drop, resizing
    selectable: true, // Allows date clicking
    selectMirror: true,
    dayMaxEvents: true, // When too many events in a day, show the popover
    events: this.calendarEvents, // Use the separate property
    // dateClick: this.handleDateClick.bind(this), // Optional: for handling date clicks
    // eventClick: this.handleEventClick.bind(this), // Optional: for handling event clicks
    datesSet: (arg) => { // Called when the date range changes (e.g., user navigates months)
      const newDate = arg.view.currentStart; // Get the start date of the current view
      // FullCalendar's month is 0-indexed, API expects 1-indexed
      const currentYear = newDate.getFullYear();
      const currentMonth = newDate.getMonth() + 1;
      this.loadReservations(currentYear, currentMonth);
    },
    eventContent: (arg) => { // Custom event rendering
      // arg.event.title, arg.event.extendedProps (for custom data)
      // You can return an HTML string or DOM nodes here
      // For now, default rendering is fine, but this is where you'd customize event appearance
      return { html: `<b>${arg.event.title}</b><br><i>${arg.event.extendedProps['clientName'] || ''}</i>` };
    }
  };

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    // Initial load for the current month/year based on FullCalendar's default view
    // The datesSet callback will handle the very first load when the calendar initializes.
    // Or, we can explicitly load for the current system date if FullCalendar doesn't trigger datesSet on init.
    // For safety, let's ensure an initial load if datesSet isn't immediately triggered.
    const today = new Date();
    this.loadReservations(today.getFullYear(), today.getMonth() + 1);
  }

  ngAfterViewInit(): void {
    // It's good practice to ensure the calendar API is available
    // and then call updateSize. A small timeout can sometimes help
    // if the rendering is particularly tricky.
    setTimeout(() => {
      if (this.calendarComponent && this.calendarComponent.getApi()) {
        this.calendarComponent.getApi().updateSize();
      }
    }, 0); // Timeout 0 to defer to next tick
  }

  loadReservations(year: number, month: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.reservationService.getAdminCalendarReservations(year, month)
      .subscribe({
        next: (data: AdminCalendarReservation[]) => {
          const events: EventInput[] = data.map(res => ({
            id: res.id.toString(),
            title: `Res #${res.id} - Hab. ${res.roomNumber || 'N/A'}`, // Changed "Room" to "Hab."
            start: res.startDate, // Assumes YYYY-MM-DD format
            end: this.getExclusiveEndDate(res.endDate), // FullCalendar's end date is exclusive
            allDay: true, // Assuming reservations are for whole days
            backgroundColor: this.getEventColor(res.status),
            borderColor: this.getEventColor(res.status),
            extendedProps: {
              clientName: res.clientName,
              roomType: res.roomType,
              status: res.status
            }
          }));
          this.calendarEvents = events;
          this.calendarOptions.events = this.calendarEvents;

          if (this.calendarComponent && this.calendarComponent.getApi()) {
            const calendarApi = this.calendarComponent.getApi();
            calendarApi.removeAllEvents();
            calendarApi.addEventSource(this.calendarEvents);
            // Try to force a re-render or update size after events are loaded
            setTimeout(() => calendarApi.updateSize(), 0);
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching calendar reservations:', err);
          this.errorMessage = err.message || 'Error al cargar las reservas.'; // Translated fallback message
          this.isLoading = false;
        }
      });
  }

  // Helper to make end date exclusive for FullCalendar
  getExclusiveEndDate(isoEndDate: string): string {
    const date = new Date(isoEndDate);
    date.setDate(date.getDate() + 1); // Add one day
    return date.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
  }

  getEventColor(status: string | undefined): string {
    if (!status) return '#6c757d'; // Default (Bootstrap secondary)
    switch (status.toLowerCase()) {
      case 'confirmada': return '#198754'; // Bootstrap success
      case 'pendiente': return '#ffc107'; // Bootstrap warning
      case 'cancelada': return '#dc3545'; // Bootstrap danger
      case 'checked-in': return '#0dcaf0'; // Bootstrap info
      case 'checked-out': return '#0d6efd'; // Bootstrap primary
      default: return '#6c757d';
    }
  }

  // Optional: Handle date click
  // handleDateClick(arg: DateSelectArg) {
  //   alert('date click! ' + arg.dateStr);
  // }

  // Optional: Handle event click
  // handleEventClick(arg: EventClickArg) {
  //   alert('event click! ' + arg.event.id);
  //   // You can open a modal with reservation details here
  // }

}
