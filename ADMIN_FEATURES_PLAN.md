# Plan: Admin Panel Features (Calendar & Check-in/Check-out)

## High-Level Plan

We'll tackle these two features sequentially:

1.  **Admin Calendar Panel:** To view reservations for the current month.
2.  **Admin Check-in/Check-out Panel:** To manage guest arrivals and departures.

## Detailed Plan

### Feature 1: Admin Calendar Panel

*   **Goal:** Allow administrators to view all reservations for a selected month in a calendar format.
*   **Backend (Symfony):**
    1.  **API Endpoint:**
        *   Create a new GET endpoint: `GET /api/admin/reservations/calendar`
        *   Accept query parameters: `year`, `month`.
        *   Fetch reservations (`Reservation` entity) within the specified month.
        *   Response to include: `id`, `room_id` (or room details), `user_id` (or user details), `startDate`, `endDate`, `status`.
        *   New method in `ReservationRepository` for querying by date range.
    2.  **Controller:**
        *   Update `ReservationController.php` or create `AdminController.php`.
        *   Ensure admin authentication/authorization.
*   **Frontend (Angular):**
    1.  **New Component:**
        *   `AdminCalendarComponent` (e.g., `frontend/src/app/admin/admin-calendar/`).
        *   Add routing in `admin.routes.ts`.
    2.  **Calendar Display:**
        *   Integrate a calendar library (e.g., FullCalendar, Angular Calendar).
        *   Fetch data from the backend API.
    3.  **Functionality:**
        *   Display reservations on the calendar.
        *   Allow navigation to previous/next months.
        *   (Optional) Clicking a reservation shows more details.
    4.  **Service:**
        *   Update `ReservationService.ts` or create `AdminService.ts` for fetching calendar reservations.

### Feature 2: Admin Check-in/Check-out Panel

*   **Goal:** Allow administrators to mark reservations as "Checked-in" or "Checked-out".
*   **Backend (Symfony):**
    1.  **Entity Modification (`Reservation.php`):**
        *   Add `checkedInAt` (nullable `DateTimeImmutable`).
        *   Add `checkedOutAt` (nullable `DateTimeImmutable`).
        *   Update database schema via migrations.
    2.  **API Endpoints:**
        *   `POST /api/admin/reservations/{id}/check-in`
        *   `POST /api/admin/reservations/{id}/check-out`
        *   Update `checkedInAt` or `checkedOutAt` fields.
    3.  **Controller:**
        *   Add actions to `ReservationController.php` (or `AdminController.php`).
        *   Implement logic for check-in/check-out validity.
        *   Ensure admin authentication/authorization.
*   **Frontend (Angular):**
    1.  **New Component:**
        *   `CheckinCheckoutComponent` (e.g., `frontend/src/app/admin/checkin-checkout/`).
        *   Add routing in `admin.routes.ts`.
    2.  **Display Reservations:**
        *   List relevant reservations (today's arrivals/departures, in-house).
        *   Display current status.
    3.  **Functionality:**
        *   "Check-in" and "Check-out" buttons.
        *   Call backend API endpoints.
        *   Update UI on success.
    4.  **Service:**
        *   Update `ReservationService.ts` (or `AdminService.ts`) for check-in/check-out API calls.

## Visual Flow (Mermaid)

```mermaid
graph TD
    A[Admin User] --> B{Admin Panel}
    B --> C[Calendar View]
    B --> D[Check-in/Check-out Panel]

    subgraph Calendar Feature
        C --> E{Select Month}
        E --> F[Frontend: Fetch Calendar Data /api/admin/reservations/calendar]
        F --> G[Backend: ReservationController]
        G --> H[Backend: ReservationRepository - Get by Date Range]
        H --> I[Database: Reservations]
        I --> H
        H --> G
        G --> F
        F --> J[Frontend: Display Calendar with Reservations]
        J --> C
    end

    subgraph Check-in/Check-out Feature
        D --> K[Frontend: View Today's Arrivals/Departures/In-House]
        K -- Check-in Action --> L[Frontend: Call /api/admin/reservations/{id}/check-in]
        K -- Check-out Action --> M[Frontend: Call /api/admin/reservations/{id}/check-out]
        L --> N[Backend: ReservationController - Check-in Action]
        M --> O[Backend: ReservationController - Check-out Action]
        N --> P[Backend: Update Reservation Entity - checkedInAt]
        O --> Q[Backend: Update Reservation Entity - checkedOutAt]
        P --> R[Database: Update Reservation]
        Q --> R
        R --> N
        R --> O
        N --> L
        O --> M
        L --> S[Frontend: Update UI]
        M --> S
        S --> K
    end