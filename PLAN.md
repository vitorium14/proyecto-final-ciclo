# Project Enhancement Plan: Frontend Review & Employee Dashboard

## 1. Introduction

This plan outlines the steps to enhance the existing Angular frontend application. The goals are to:
1.  Review and improve the current public-facing pages (Home, Contact, Login, Register).
2.  Implement a separate login mechanism for employees.
3.  Create a dedicated dashboard section for employees (accessible via the employee login) to perform CRUD (Create, Read, Update, Delete) operations on various data entities managed by the backend API.

## 2. Phases

### Phase 1: Frontend Foundation & Employee Login

*   **Review Existing Public Pages:**
    *   Perform a general review of `HomeComponent`, `ContactComponent`, `LoginComponent`, and `RegisterComponent`.
    *   Identify and fix bugs.
    *   Enhance UI/UX (e.g., form validation, responsiveness).
*   **Employee Login Link:**
    *   Modify `frontend/src/app/shared/footer/footer.component.html` to add a discreet "Employee Access" link/button.
*   **Employee Login Component & Route:**
    *   Create `frontend/src/app/auth/employee-login/employee-login.component.ts` (and related files).
    *   Add route `employee/login` in `frontend/src/app/app.routes.ts`, likely using `PublicLayoutComponent`.

### Phase 2: Employee Dashboard Structure

*   **Admin Layout:**
    *   Create `frontend/src/app/layouts/admin-layout/admin-layout.component.ts` (and related files) for the employee section (e.g., with sidebar navigation).
*   **Dashboard Component:**
    *   Create `frontend/src/app/admin/dashboard/dashboard.component.ts` (and related files) as the employee landing page.
*   **Employee/Admin Guard:**
    *   Create `frontend/src/app/auth/employee.guard.ts`. This guard will check if the logged-in user has `ROLE_EMPLOYEE` or `ROLE_ADMIN`.
*   **Admin Routing Module:**
    *   Create `frontend/src/app/admin/admin.routes.ts`.
    *   Define routes under `/employee`, protected by `EmployeeGuard` and using `AdminLayoutComponent`. Include the `DashboardComponent` route and placeholders for future CRUD routes.
    *   Import admin routes into `frontend/src/app/app.routes.ts`.

### Phase 3: Backend API & Security

*   **Review API Controllers:**
    *   Examine existing controllers (`RoomController`, `ReservationController`, `UserController`).
*   **Create/Extend API Endpoints:**
    *   Create `backend/src/Controller/ServiceController.php` for Service CRUD.
    *   Ensure full CRUD endpoints exist and function correctly for Users, Rooms, Reservations, and Services.
*   **Secure API Endpoints:**
    *   Modify `backend/config/packages/security.yaml`.
    *   Add specific `access_control` rules:
        *   User CRUD (`/api/users/**`): Requires `ROLE_ADMIN`.
        *   Room CRUD (`/api/rooms/**`): Requires `ROLE_EMPLOYEE` or `ROLE_ADMIN`.
        *   Reservation CRUD (`/api/reservations/**`): Requires `ROLE_EMPLOYEE` or `ROLE_ADMIN`.
        *   Service CRUD (`/api/services/**`): Requires `ROLE_EMPLOYEE` or `ROLE_ADMIN`.
        *   Ensure `/api/register/employee` requires `ROLE_ADMIN`.
        *   Maintain `IS_AUTHENTICATED_FULLY` as the general requirement for `/api`.

### Phase 4: CRUD Implementation & Integration

*   **Frontend CRUD Components:**
    *   Create components within `frontend/src/app/admin/` for managing Users, Rooms, Reservations, and Services (e.g., `user-management`, `room-management`).
    *   Add routes for these components in `admin.routes.ts`.
    *   Implement UI for list, create, edit, delete operations.
*   **Frontend Service Integration:**
    *   Create/update Angular services (`UserService`, `RoomService`, `ReservationService`, `ServiceService`) to interact with backend API endpoints.
    *   Connect CRUD components to these services.
*   **Refine Auth Service:**
    *   Update `frontend/src/app/auth/auth.service.ts` to decode JWT, store user roles, and provide methods to check roles (for guards and UI logic).
*   **Role-Based UI:**
    *   Ensure UI elements (e.g., navigation links, action buttons) are conditionally displayed based on user roles (e.g., hide User Management link if not `ROLE_ADMIN`).

### Phase 5: Testing & Refinement

*   **Testing:** Implement unit, integration, and end-to-end tests covering new features and backend endpoints.
*   **Refinement:** Address bugs and refine UI/UX based on testing and feedback.

## 3. Frontend Structure Diagram

```mermaid
graph TD
    App -->|Routes| RoutesConfig[app.routes.ts]

    RoutesConfig --> PublicLayout[PublicLayoutComponent]
    RoutesConfig --> EmployeeLogin[EmployeeLoginComponent]
    RoutesConfig --> AdminRoutes[admin.routes.ts]

    PublicLayout --> HomeComponent
    PublicLayout --> ContactComponent
    PublicLayout --> LoginComponent
    PublicLayout --> RegisterComponent

    AdminRoutes --> AdminLayout[AdminLayoutComponent]
    AdminLayout -->|Guard| EmployeeGuard[EmployeeGuard]
    AdminLayout --> DashboardComponent
    AdminLayout --> UserManagementComponent
    AdminLayout --> RoomManagementComponent
    AdminLayout --> ReservationManagementComponent
    AdminLayout --> ServiceManagementComponent

    subgraph Shared
        HeaderComponent
        FooterComponent
    end

    subgraph Auth
        AuthService
        AuthGuard
        EmployeeGuard
        LoginComponent
        RegisterComponent
        EmployeeLoginComponent
    end

    subgraph Services
        UserService
        RoomService
        ReservationService
        ServiceService
    end

    PublicLayout --> HeaderComponent
    PublicLayout --> FooterComponent
    AdminLayout --> HeaderComponent  # Consider if Admin needs a different header
    AdminLayout --> FooterComponent  # Consider if footer is needed in Admin

    HomeComponent --> RoomService
    LoginComponent --> AuthService
    RegisterComponent --> AuthService
    EmployeeLoginComponent --> AuthService
    EmployeeGuard --> AuthService
    UserManagementComponent --> UserService
    RoomManagementComponent --> RoomService
    ReservationManagementComponent --> ReservationService
    ServiceManagementComponent --> ServiceService
```

## 4. Key Decisions & Clarifications

*   **Existing Pages Review:** A general review and enhancement is sufficient.
*   **Employee Permissions:**
    *   `ROLE_ADMIN`: Manages Users, Rooms, Reservations, Services.
    *   `ROLE_EMPLOYEE`: Manages Rooms, Reservations, Services.
*   **CRUD Entities:** Full CRUD is required for Users, Rooms, Reservations, and Services.
*   **Service Management:** Required. A new `ServiceController` and associated API endpoints/frontend components are needed.