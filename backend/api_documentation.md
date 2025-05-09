# API Documentation

This document provides details about the API endpoints for the application.

## Base URL

The base URL for all API endpoints is assumed to be `/` (as controllers routes start directly with `/users`, `/rooms`, etc.). If a global prefix like `/api` is configured, it should be prepended.

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. Clients should first obtain a token by calling the `/login` endpoint with valid credentials. This token must then be included in the `Authorization` header of subsequent requests as a Bearer token:

`Authorization: Bearer <your_jwt_token>`

The `/logout` endpoint is available to invalidate a token. The `/register` endpoint allows new users to create an account.

## General Considerations

*   All request bodies and response payloads are in JSON format.
*   Date format: Dates in query parameters or request/response bodies should generally follow `YYYY-MM-DD` format. DateTime fields in responses are typically ISO 8601 (e.g., `YYYY-MM-DDTHH:MM:SS+00:00`).
*   Error responses: Errors are returned in a consistent JSON format, typically:
    ```json
    {
        "status_code": 4xx_or_5xx,
        "message": "A descriptive error message."
    }
    ```
    For validation errors, `message` might be more generic, and a `details` field could be included.

## Auth Endpoints

Endpoints related to authentication and user registration.

### 1. User Login

*   **Endpoint:** `POST /login`
*   **Description:** Authenticates a user and returns a JWT token along with user details.
*   **Request Body:**
    ```json
    {
        "email": "user@example.com",
        "password": "yourpassword"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": 1,
            "name": "John",
            "surnames": "Doe",
            "email": "john.doe@example.com",
            "role": "CLIENT",
            "bookings": []
        }
    }
    ```
    *(The user object structure depends on the serialization group, likely 'user')*
*   **Response (400 Bad Request):** If email or password are not provided or JSON is invalid.
    ```json
    {
        "message": "Invalid JSON payload. Email and password are required."
    }
    ```
*   **Response (401 Unauthorized):** If credentials are invalid.
    ```json
    {
        "message": "Invalid credentials"
    }
    ```

### 2. User Logout

*   **Endpoint:** `POST /logout`
*   **Description:** Logs out the user by revoking their current JWT token. The token to be revoked is expected in the request body.
*   **Request Body:**
    ```json
    {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
*   **Response (200 OK):**
    ```json
    {
        "message": "Logged out successfully"
    }
    ```
*   **Response (400 Bad Request/500 Internal Server Error):** If the token is missing or invalid, or if an error occurs during token revocation. (Note: The controller code implies the token is found or an error occurs; specific error messages for missing/invalid token in body should be verified).

### 3. User Registration

*   **Endpoint:** `POST /register`
*   **Description:** Creates a new user account.
*   **Request Body:**
    ```json
    {
        "name": "Jane",
        "surnames": "Doe",
        "email": "jane.doe@example.com",
        "password": "securepassword123",
        "role": "CLIENT"
    }
    ```
    *   `role` can be `CLIENT`, `EMPLOYEE`, or `ADMIN`. Creating `EMPLOYEE` or `ADMIN` roles requires the requester to be an authenticated admin.
*   **Response (201 Created):**
    ```json
    {
        "id": 2,
        "name": "Jane",
        "surnames": "Doe",
        "email": "jane.doe@example.com",
        "role": "CLIENT",
        "bookings": [] 
    }
    ```
    *(The user object structure depends on the serialization group, likely 'user'; password is not returned)*
*   **Response (400 Bad Request):**
    *   If required fields are missing: `{"message": "Missing or empty field: <field_name>"}`
    *   If the user already exists: `{"message": "User already exists"}`
    *   If the role is invalid: `{"message": "Invalid role"}`
*   **Response (401 Unauthorized):** If a non-admin user attempts to create an `EMPLOYEE` or `ADMIN`.
    ```json
    {
        "message": "Unauthorized"
    }
    ```

## Endpoints

### User Management

Endpoints related to user operations. Note: User creation is handled via the `POST /register` endpoint in the "Auth Endpoints" section.

#### 1. Get All Users

*   **Endpoint:** `GET /users`
*   **Description:** Retrieves a list of all users. Requires `EMPLOYEE` or `ADMIN` role.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    [
        {
            "id": 1,
            "name": "John",
            "surnames": "Doe",
            "email": "john.doe@example.com",
            "role": "CLIENT",
            "bookings": []
        }
    ]
    ```
*   **Serialization Group:** `user`
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.

#### 2. Get User by ID

*   **Endpoint:** `GET /users/{id}`
*   **Description:** Retrieves a specific user by their ID. `EMPLOYEE` or `ADMIN` can retrieve any user. Regular users can only retrieve their own profile.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the user.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    {
        "id": 1,
        "name": "John",
        "surnames": "Doe",
        "email": "john.doe@example.com",
        "role": "CLIENT",
        "bookings": []
    }
    ```
*   **Response (404 Not Found):** If the user does not exist.
*   **Serialization Group:** `user`
*   **Response (401 Unauthorized):** If a user attempts to access another user's profile without `EMPLOYEE` or `ADMIN` privileges.

#### 3. Update User

*   **Endpoint:** `PUT /users/{id}`
*   **Description:** Updates an existing user. `ADMIN` can update any user and change roles. Regular users can update their own information but cannot change their role to `ADMIN` or `EMPLOYEE`.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the user to update.
*   **Request Body:**
    ```json
    {
        "name": "Jane Updated",
        "surnames": "Doe Updated",
        "email": "jane.doe.updated@example.com",
        "password": "newsecurepassword123", 
        "role": "EMPLOYEE" 
    }
    ```
    *Note: The `password` field is write-only and will not be returned in responses.*
*   **Response (200 OK):**
    ```json
    {
        "id": 2,
        "name": "Jane Updated",
        "surnames": "Doe Updated",
        "email": "jane.doe.updated@example.com",
        "role": "EMPLOYEE",
        "bookings": []
    }
    ```
*   **Response (400 Bad Request):** If the role is invalid (e.g., `{"error": "Invalid role. Must be ADMIN, EMPLOYEE or CLIENT."}`).
*   **Response (401 Unauthorized):** If a user attempts to modify another user's profile without `ADMIN` privileges, or if a non-admin attempts to change a role to `ADMIN` or `EMPLOYEE`.
*   **Response (404 Not Found):** If the user does not exist.
*   **Serialization Group:** `user`

#### 4. Delete User

*   **Endpoint:** `DELETE /users/{id}`
*   **Description:** Deletes a user. Requires `EMPLOYEE` or `ADMIN` role.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the user to delete.
*   **Request Body:** None
*   **Response (204 No Content):** Successfully deleted.
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.
*   **Response (404 Not Found):** If the user does not exist.

### Room Management

Endpoints related to room operations.

#### 1. Get All Rooms

*   **Endpoint:** `GET /rooms`
*   **Description:** Retrieves a list of all rooms.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    [
        {
            "id": 1,
            "name": "Room 101",
            "type": { /* RoomType object details */ },
            "status": "Available",
            "observations": "Sea view",
            "bookings": []
        }
    ]
    ```
*   **Serialization Group:** `room`

#### 2. Get Room by ID

*   **Endpoint:** `GET /rooms/{id}`
*   **Description:** Retrieves a specific room by its ID.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the room.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    {
        "id": 1,
        "name": "Room 101",
        "type": { /* RoomType object details */ },
        "status": "Available",
        "observations": "Sea view",
        "bookings": []
    }
    ```
*   **Response (404 Not Found):** If the room does not exist.
*   **Serialization Group:** `room`

#### 3. Create Room

*   **Endpoint:** `POST /rooms`
*   **Description:** Creates a new room. Requires `EMPLOYEE` or `ADMIN` role.
*   **Request Body:**
    ```json
    {
        "name": "Room 102",
        "type": 1, 
        "status": "Available",
        "observations": "Garden view"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
        "id": 2,
        "name": "Room 102",
        "type": { /* RoomType object based on ID 1 */ },
        "status": "Available",
        "observations": "Garden view",
        "bookings": []
    }
    ```
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.
*   **Response (404 Not Found):** If the `type` (RoomType ID) does not exist.
*   **Serialization Group:** `room`

#### 4. Update Room

*   **Endpoint:** `PUT /rooms/{id}`
*   **Description:** Updates an existing room. Requires `EMPLOYEE` or `ADMIN` role.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the room to update.
*   **Request Body:**
    ```json
    {
        "name": "Room 101 Deluxe",
        "type": 2, 
        "status": "Maintenance",
        "observations": "Updated observation"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
        "id": 1,
        "name": "Room 101 Deluxe",
        "type": { /* RoomType object based on ID 2 */ },
        "status": "Maintenance",
        "observations": "Updated observation",
        "bookings": []
    }
    ```
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.
*   **Response (404 Not Found):** If the room or the `type` (RoomType ID) does not exist.
*   **Serialization Group:** `room`

#### 5. Delete Room

*   **Endpoint:** `DELETE /rooms/{id}`
*   **Description:** Deletes a room. Requires `EMPLOYEE` or `ADMIN` role.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the room to delete.
*   **Request Body:** None
*   **Response (204 No Content):** Successfully deleted.
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.
*   **Response (404 Not Found):** If the room does not exist.

#### 6. Get Available Rooms by Date Range

*   **Endpoint:** `GET /rooms/available`
*   **Description:** Retrieves a list of rooms that are available within the specified date range (inclusive).
*   **Query Parameters:**
    *   `startDate` (string, required): The start date of the desired availability period (format: `YYYY-MM-DD`).
    *   `endDate` (string, required): The end date of the desired availability period (format: `YYYY-MM-DD`).
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    [
        {
            "id": 1,
            "name": "Room 101",
            "type": { /* RoomType object details */ },
            "status": "Available", // Status might still be relevant, but availability is confirmed by this endpoint for the range
            "observations": "Sea view",
            "bookings": [] // Bookings array might be filtered or not directly relevant here if only available rooms are returned
        }
        // ... other available rooms
    ]
    ```
*   **Response (400 Bad Request):**
    *   If `startDate` or `endDate` are missing: `{"status_code": 400, "message": "Los parámetros query startDate y endDate son requeridos."}`
    *   If date format is invalid: `{"status_code": 400, "message": "Formato de fecha inválido para startDate o endDate. Use YYYY-MM-DD."}`
    *   If `startDate` is after `endDate`: `{"status_code": 400, "message": "startDate no puede ser posterior a endDate."}`
*   **Serialization Group:** `room`

### Room Type Management

Endpoints related to room type operations.

#### 1. Get All Room Types

*   **Endpoint:** `GET /room-types`
*   **Description:** Retrieves a list of all room types.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    [
        {
            "id": 1,
            "name": "Standard Double Room",
            "description": "A comfortable room for two.",
            "price": "100.00",
            "capacity": 2,
            "amenities": ["Wi-Fi", "TV", "AC"],
            "images": [ { "id": 1, "image": "base64_encoded_string..." } ],
            "rooms": []
        }
    ]
    ```
*   **Serialization Group:** `room_type`

#### 2. Get Room Type by ID

*   **Endpoint:** `GET /room-types/{id}`
*   **Description:** Retrieves a specific room type by its ID.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the room type.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    {
        "id": 1,
        "name": "Standard Double Room",
        "description": "A comfortable room for two.",
        "price": "100.00",
        "capacity": 2,
        "amenities": ["Wi-Fi", "TV", "AC"],
        "images": [ { "id": 1, "image": "base64_encoded_string..." } ],
        "rooms": []
    }
    ```
*   **Response (404 Not Found):** If the room type does not exist.
*   **Serialization Group:** `room_type`

#### 3. Create Room Type

*   **Endpoint:** `POST /room-types`
*   **Description:** Creates a new room type. Requires `EMPLOYEE` or `ADMIN` role.
*   **Request Body:**
    ```json
    {
        "name": "Deluxe Suite",
        "description": "A luxurious suite with a king bed.",
        "price": "250.00",
        "capacity": 2,
        "amenities": ["Wi-Fi", "TV", "AC", "Minibar", "Jacuzzi"],
        "images": [ 
            { "image": "base64_encoded_string_for_image1..." },
            { "image": "base64_encoded_string_for_image2..." }
        ]
    }
    ```
*   **Response (201 Created):**
    ```json
    {
        "id": 2,
        "name": "Deluxe Suite",
        "description": "A luxurious suite with a king bed.",
        "price": "250.00",
        "capacity": 2,
        "amenities": ["Wi-Fi", "TV", "AC", "Minibar", "Jacuzzi"],
        "images": [
            { "id": 2, "image": "base64_encoded_string_for_image1..." },
            { "id": 3, "image": "base64_encoded_string_for_image2..." }
        ],
        "rooms": []
    }
    ```
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.
*   **Serialization Group:** `room_type`

#### 4. Update Room Type

*   **Endpoint:** `PUT /room-types/{id}`
*   **Description:** Updates an existing room type. Requires `EMPLOYEE` or `ADMIN` role. Note: Existing images are cleared and replaced by the new list of images provided.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the room type to update.
*   **Request Body:**
    ```json
    {
        "name": "Deluxe Suite (Renovated)",
        "description": "A newly renovated luxurious suite.",
        "price": "275.00",
        "capacity": 3,
        "amenities": ["Wi-Fi", "Smart TV", "AC", "Minibar", "Jacuzzi", "Balcony"],
        "images": [
            { "image": "base64_encoded_string_for_new_image1..." }
        ]
    }
    ```
*   **Response (200 OK):**
    ```json
    {
        "id": 2,
        "name": "Deluxe Suite (Renovated)",
        "description": "A newly renovated luxurious suite.",
        "price": "275.00",
        "capacity": 3,
        "amenities": ["Wi-Fi", "Smart TV", "AC", "Minibar", "Jacuzzi", "Balcony"],
        "images": [
            { "id": 4, "image": "base64_encoded_string_for_new_image1..." }
        ],
        "rooms": []
    }
    ```
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.
*   **Response (404 Not Found):** If the room type does not exist.
*   **Serialization Group:** `room_type`

#### 5. Delete Room Type

*   **Endpoint:** `DELETE /room-types/{id}`
*   **Description:** Deletes a room type. Requires `EMPLOYEE` or `ADMIN` role.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the room type to delete.
*   **Request Body:** None
*   **Response (204 No Content):** Successfully deleted.
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.
*   **Response (404 Not Found):** If the room type does not exist.

### Service Management

Endpoints related to service operations.

#### 1. Get All Services

*   **Endpoint:** `GET /services`
*   **Description:** Retrieves a list of all services.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    [
        {
            "id": 1,
            "name": "Airport Shuttle",
            "description": "Transfer to and from the airport.",
            "price": "25.00",
            "duration": null,
            "images": [ { "id": 1, "image": "base64_encoded_string..." } ]
        }
    ]
    ```
*   **Serialization Group:** `service`

#### 2. Get Service by ID

*   **Endpoint:** `GET /services/{id}`
*   **Description:** Retrieves a specific service by its ID.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the service.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    {
        "id": 1,
        "name": "Airport Shuttle",
        "description": "Transfer to and from the airport.",
        "price": "25.00",
        "duration": null,
        "images": [ { "id": 1, "image": "base64_encoded_string..." } ]
    }
    ```
*   **Response (404 Not Found):** If the service does not exist.
*   **Serialization Group:** `service`

#### 3. Create Service

*   **Endpoint:** `POST /services`
*   **Description:** Creates a new service. Requires `EMPLOYEE` or `ADMIN` role.
*   **Request Body:**
    ```json
    {
        "name": "Breakfast Buffet",
        "description": "Full breakfast buffet options.",
        "price": "15.00",
        "duration": null,
        "images": [
            { "image": "base64_encoded_string_for_image1..." }
        ]
    }
    ```
*   **Response (201 Created):**
    ```json
    {
        "id": 2,
        "name": "Breakfast Buffet",
        "description": "Full breakfast buffet options.",
        "price": "15.00",
        "duration": null,
        "images": [
            { "id": 2, "image": "base64_encoded_string_for_image1..." }
        ]
    }
    ```
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.
*   **Serialization Group:** `service`

#### 4. Update Service

*   **Endpoint:** `PUT /services/{id}`
*   **Description:** Updates an existing service. Requires `EMPLOYEE` or `ADMIN` role. Note: Existing images are cleared and replaced by the new list of images provided.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the service to update.
*   **Request Body:**
    ```json
    {
        "name": "Premium Airport Shuttle",
        "description": "Luxury transfer to and from the airport.",
        "price": "50.00",
        "duration": null,
        "images": []
    }
    ```
*   **Response (200 OK):**
    ```json
    {
        "id": 1,
        "name": "Premium Airport Shuttle",
        "description": "Luxury transfer to and from the airport.",
        "price": "50.00",
        "duration": null,
        "images": []
    }
    ```
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.
*   **Response (404 Not Found):** If the service does not exist.
*   **Serialization Group:** `service`

#### 5. Delete Service

*   **Endpoint:** `DELETE /services/{id}`
*   **Description:** Deletes a service. Requires `EMPLOYEE` or `ADMIN` role.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the service to delete.
*   **Request Body:** None
*   **Response (204 No Content):** Successfully deleted.
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.
*   **Response (404 Not Found):** If the service does not exist.

### Booking Management

Endpoints related to booking operations.

#### 1. Get All Bookings

*   **Endpoint:** `GET /bookings`
*   **Description:** Retrieves a list of all bookings. Requires `EMPLOYEE` or `ADMIN` role.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    [
        {
            "id": 1,
            "user": { /* User object */ },
            "services": [ { /* Service object details */ } ],
            "checkIn": "YYYY-MM-DDTHH:MM:SS+00:00",
            "checkOut": "YYYY-MM-DDTHH:MM:SS+00:00",
            "checkedIn": false,
            "checkedOut": false,
            "room": { /* Room object details */ },
            "price": "350.50"
        }
    ]
    ```
*   **Serialization Group:** `booking`
*   **Response (401 Unauthorized):** If the user is not an `EMPLOYEE` or `ADMIN`.

#### 2. Get Booking by ID

*   **Endpoint:** `GET /bookings/{id}`
*   **Description:** Retrieves a specific booking by its ID. `EMPLOYEE` or `ADMIN` can retrieve any booking. Regular users can only retrieve their own bookings.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the booking.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    {
        "id": 1,
        "user": { /* User object */ },
        "services": [ { /* Service object details */ } ],
        "checkIn": "YYYY-MM-DDTHH:MM:SS+00:00",
        "checkOut": "YYYY-MM-DDTHH:MM:SS+00:00",
        "checkedIn": false,
        "checkedOut": false,
        "room": { /* Room object details */ },
        "price": "350.50"
    }
    ```
*   **Serialization Group:** `booking`
*   **Response (401 Unauthorized):** If a user attempts to access another user's booking without appropriate privileges.

#### 3. Get Bookings by User ID

*   **Endpoint:** `GET /bookings/user/{userId}`
*   **Description:** Retrieves all bookings for a specific user. `EMPLOYEE` or `ADMIN` can retrieve bookings for any user. Regular users can only retrieve their own bookings.
*   **Path Parameters:**
    *   `userId` (integer, required): The ID of the user whose bookings are to be retrieved.
*   **Request Body:** None
*   **Response (200 OK):** (Similar to Get All Bookings, but filtered by `userId`)
    ```json
    [
        {
            "id": 1,
            "user": { "id": /* userId */, /* ...other user details... */ },
            "services": [ { /* Service object details */ } ],
            "checkIn": "YYYY-MM-DDTHH:MM:SS+00:00",
            "checkOut": "YYYY-MM-DDTHH:MM:SS+00:00",
            "checkedIn": false,
            "checkedOut": false,
            "room": { /* Room object details */ },
            "price": "350.50"
        }
    ]
    ```
    *   Returns an empty array `[]` if no bookings are found for the user.
*   **Response (401 Unauthorized):** If a user attempts to access another user's bookings without appropriate privileges.
*   **Serialization Group:** `booking`

#### 4. Create Booking

*   **Endpoint:** `POST /bookings`
*   **Description:** Creates a new booking. The price is calculated on the backend based on room type, duration, and selected services. No specific role-based authorization is explicitly checked in the controller for this action; access may depend on global authentication requirements.
*   **Request Body:**
    ```json
    {
        "user": 1, // ID of the user making the booking
        "services": [1, 2], // Array of Service IDs
        "checkIn": "YYYY-MM-DD HH:MM:SS", // e.g., "2024-08-15 14:00:00"
        "checkOut": "YYYY-MM-DD HH:MM:SS", // e.g., "2024-08-18 11:00:00"
        "checkedIn": false, // Optional, defaults to false
        "checkedOut": false, // Optional, defaults to false
        "room": 1, // ID of the room being booked
        "duration": 3 // Duration of stay in nights, used for price calculation
    }
    ```
*   **Response (201 Created):**
    ```json
    {
        "id": 2,
        "user": { /* User object for ID 1 */ },
        "services": [ { /* Service object for ID 1 */ }, { /* Service object for ID 2 */ } ],
        "checkIn": "YYYY-MM-DDTHH:MM:SS+00:00",
        "checkOut": "YYYY-MM-DDTHH:MM:SS+00:00",
        "checkedIn": false,
        "checkedOut": false,
        "room": { /* Room object for ID 1 */ },
        "price": "Calculated_Price"
    }
    ```
*   **Response (400 Bad Request):** If a `serviceId` in the `services` array is not found (e.g., `{"error": "Service not found"}`).
*   **Response (404 Not Found):** If `user` or `room` ID does not exist (Note: controller might implicitly handle this with Doctrine, or it could lead to an error if not found before persisting).
*   **Serialization Group:** `booking`

#### 5. Update Booking

*   **Endpoint:** `PUT /bookings/{id}`
*   **Description:** Updates an existing booking. Price is recalculated. No specific role-based authorization is explicitly checked in the controller for this action; it's typically expected that users can only update their own bookings or that `ADMIN`/`EMPLOYEE` roles have this privilege. This should be confirmed by application-level authorization rules.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the booking to update.
*   **Request Body:** (Similar to Create Booking, all fields expected)
    ```json
    {
        "user": 1,
        "services": [1],
        "checkIn": "YYYY-MM-DD HH:MM:SS",
        "checkOut": "YYYY-MM-DD HH:MM:SS",
        "checkedIn": true,
        "checkedOut": false,
        "room": 1,
        "duration": 3
    }
    ```
*   **Response (200 OK):**
    ```json
    {
        "id": 1,
        // ... updated booking details ...
        "price": "Recalculated_Price"
    }
    ```
*   **Response (400 Bad Request):** If a `serviceId` in the `services` array is not found.
*   **Response (404 Not Found):** If the booking ID, `user` ID, or `room` ID does not exist.
*   **Serialization Group:** `booking`

#### 6. Delete Booking

*   **Endpoint:** `DELETE /bookings/{id}`
*   **Description:** Deletes a booking. No specific role-based authorization is explicitly checked in the controller for this action; it's typically expected that users can only delete their own bookings or that `ADMIN`/`EMPLOYEE` roles have this privilege. This should be confirmed by application-level authorization rules.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the booking to delete.
*   **Request Body:** None
*   **Response (204 No Content):** Successfully deleted.
*   **Response (404 Not Found):** If the booking does not exist. 