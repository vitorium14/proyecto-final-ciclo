# Admin Section Update Plan

## Summary of Findings

Based on the review of `User`, `Room`, `Service`, and `Reservation` management components and services:

1.  **Design Consistency:**
    *   **New Design:** Room Management and Service Management components use a modern, consistent design (cards/grid, advanced filters, modals, Bootstrap icons).
    *   **Old Design:** User Management and Reservation Management components use an older, simpler design (basic Bootstrap tables).
2.  **API Integration:**
    *   **Services:** All four services (`UserService`, `RoomService`, `ServiceService`, `ReservationService`) are correctly configured to point to the real backend API endpoints (`http://localhost:8000/api/...`).
    *   **Components:**
        *   User Management & Reservation Management: Components load data using the service (real API) but lack full CRUD implementation and use the old design.
        *   Room Management & Service Management: Components have the full CRUD structure (filtering, pagination, modals) and the new design, but are currently **using mock data** instead of calling the service methods for API interaction.
3.  **Data Models:** None of the components or services currently use strongly-typed, shared data models (interfaces/classes). They rely on `any` or locally defined interfaces.

## Proposed Plan

1.  **Establish Shared Models:**
    *   Create dedicated TypeScript interface/class files for `User`, `Room`, `Service`, and `Reservation` within a shared location (e.g., `frontend/src/app/models/`).
    *   Update all four services (`user.service.ts`, `room.service.ts`, `service.service.ts`, `reservation.service.ts`) to import and use these models instead of `any`.
2.  **Connect Room Management to API:**
    *   Modify `room-management.component.ts` to use the shared `Room` model.
    *   Remove the mock data logic (`getMockRooms`, `setTimeout`).
    *   Uncomment and integrate the existing (but commented out) API calls within the `loadRooms`, `addRoom`, `updateRoom`, and `deleteRoom` methods, ensuring they use `RoomService`.
3.  **Connect Service Management to API:**
    *   Modify `service-management.component.ts` to use the shared `Service` model.
    *   Remove the mock data logic (`getMockServices`, `setTimeout`).
    *   Uncomment and integrate the existing API calls within the `loadServices`, `addService`, `updateService`, and `deleteService` methods, ensuring they use `ServiceService`.
4.  **Refactor User Management:**
    *   Update `user-management.component.ts` to use the shared `User` model.
    *   Implement full CRUD functionality:
        *   Add filtering controls (search, role filter).
        *   Implement pagination.
        *   Integrate `NgbModal` for adding, editing, and deleting users, similar to Room/Service Management.
        *   Implement the `addUser`, `updateUser`, `deleteUser` methods using `UserService`.
    *   Rewrite `user-management.component.html` and `user-management.component.scss` to match the "new design" established by Room/Service Management (using a table layout similar to the old design but with the new styling elements).
5.  **Refactor Reservation Management:**
    *   Update `reservation-management.component.ts` to use the shared `Reservation` model.
    *   Implement full CRUD functionality:
        *   Add filtering controls (search, date range, status filter).
        *   Implement pagination.
        *   Integrate `NgbModal` for viewing details, potentially editing status/dates, and deleting reservations.
        *   Implement the necessary methods using `ReservationService`.
    *   Rewrite `reservation-management.component.html` and `reservation-management.component.scss` to match the "new design", likely using a table layout with the updated styling.
6.  **Final Review:** Briefly check the `AdminLayoutComponent` and `DashboardComponent` for any inconsistencies after the other sections are updated.

## Workflow Diagram

```mermaid
graph TD
    A[Start: Review Admin Section] --> B{Define Shared Models};
    B --> C[Update Services w/ Models];
    C --> D{Connect Room Mgmt to API};
    C --> E{Connect Service Mgmt to API};
    C --> F{Refactor User Mgmt};
    C --> G{Refactor Reservation Mgmt};
    F --> H[Implement User CRUD & New Design];
    G --> I[Implement Reservation CRUD & New Design];
    D & E & H & I --> J[Final Review: Layout/Dashboard];
    J --> K[End: Admin Section Updated];