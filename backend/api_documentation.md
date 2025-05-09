# API Documentation

This document provides details about the API endpoints for the application.

## Base URL

The base URL for all API endpoints is assumed to be `/` (as controllers routes start directly with `/users`, `/rooms`, etc.). If a global prefix like `/api` is configured, it should be prepended.

## Authentication

Details about authentication mechanisms (e.g., JWT, API Keys) should be added here if applicable. Currently, no authentication seems to be explicitly implemented in the controllers.

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

## Endpoints

### User Management

Endpoints related to user operations.

#### 1. Get All Users

*   **Endpoint:** `GET /users`
*   **Description:** Retrieves a list of all users.
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

#### 2. Get User by ID

*   **Endpoint:** `GET /users/{id}`
*   **Description:** Retrieves a specific user by their ID.
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

#### 3. Create User

*   **Endpoint:** `POST /users`
*   **Description:** Creates a new user.
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
    *Note: The `password` field is write-only and will not be returned in responses.*
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
*   **Response (400 Bad Request):** If the role is invalid (e.g., `{"status_code": 400, "message": "Invalid role. Must be ADMIN, EMPLOYEE or CLIENT."}`).
*   **Serialization Group:** `user`

#### 4. Update User

*   **Endpoint:** `PUT /users/{id}`
*   **Description:** Updates an existing user.
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
*   **Response (400 Bad Request):** If the role is invalid.
*   **Response (404 Not Found):** If the user does not exist.
*   **Serialization Group:** `user`

#### 5. Delete User

*   **Endpoint:** `DELETE /users/{id}`
*   **Description:** Deletes a user.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the user to delete.
*   **Request Body:** None
*   **Response (204 No Content):** Successfully deleted.
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
*   **Description:** Creates a new room.
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
*   **Response (404 Not Found):** If the `type` (RoomType ID) does not exist.
*   **Serialization Group:** `room`

#### 4. Update Room

*   **Endpoint:** `PUT /rooms/{id}`
*   **Description:** Updates an existing room.
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
*   **Response (404 Not Found):** If the room or the `type` (RoomType ID) does not exist.
*   **Serialization Group:** `room`

#### 5. Delete Room

*   **Endpoint:** `DELETE /rooms/{id}`
*   **Description:** Deletes a room.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the room to delete.
*   **Request Body:** None
*   **Response (204 No Content):** Successfully deleted.
*   **Response (404 Not Found):** If the room does not exist.

#### 6. Get Available Rooms by Date Range

*   **Endpoint:** `GET /rooms/available`
*   **Description:** Retrieves rooms available within a specified date range.
*   **Query Parameters:**
    *   `startDate` (string, required): The start date of the range (Format: `YYYY-MM-DD`).
    *   `endDate` (string, required): The end date of the range (Format: `YYYY-MM-DD`).
*   **Example URL:** `/rooms/available?startDate=2024-01-01&endDate=2024-01-10`
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    [
        {
            "id": 3,
            "name": "Room 201",
            "type": { /* RoomType object details */ },
            "status": "Available",
            "observations": "Pool view",
            "bookings": [] 
        }
    ]
    ```
*   **Response (400 Bad Request):** If `startDate` or `endDate` are missing or in an invalid format, or if `startDate` is after `endDate`.
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
*   **Description:** Creates a new room type.
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
*   **Serialization Group:** `room_type`

#### 4. Update Room Type

*   **Endpoint:** `PUT /room-types/{id}`
*   **Description:** Updates an existing room type. Note: Existing images are cleared and replaced by the new list of images provided.
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
*   **Response (404 Not Found):** If the room type does not exist.
*   **Serialization Group:** `room_type`

#### 5. Delete Room Type

*   **Endpoint:** `DELETE /room-types/{id}`
*   **Description:** Deletes a room type.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the room type to delete.
*   **Request Body:** None
*   **Response (204 No Content):** Successfully deleted.
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
*   **Description:** Creates a new service.
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
*   **Serialization Group:** `service`

#### 4. Update Service

*   **Endpoint:** `PUT /services/{id}`
*   **Description:** Updates an existing service. Note: Existing images are cleared and replaced by the new list of images provided.
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
*   **Response (404 Not Found):** If the service does not exist.
*   **Serialization Group:** `service`

#### 5. Delete Service

*   **Endpoint:** `DELETE /services/{id}`
*   **Description:** Deletes a service.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the service to delete.
*   **Request Body:** None
*   **Response (204 No Content):** Successfully deleted.
*   **Response (404 Not Found):** If the service does not exist.

### Booking Management

Endpoints related to booking operations.

#### 1. Get All Bookings

*   **Endpoint:** `GET /bookings`
*   **Description:** Retrieves a list of all bookings.
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

#### 2. Get Booking by ID

*   **Endpoint:** `GET /bookings/{id}`
*   **Description:** Retrieves a specific booking by its ID.
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
*   **Response (404 Not Found):** If the booking does not exist.
*   **Serialization Group:** `booking`

#### 3. Create Booking

*   **Endpoint:** `POST /bookings`
*   **Description:** Creates a new booking. The price is calculated on the backend.
*   **Request Body:**
    ```json
    {
        "user": 1, 
        "services": [1, 2], 
        "checkIn": "YYYY-MM-DD HH:MM:SS", 
        "checkOut": "YYYY-MM-DD HH:MM:SS",
        "checkedIn": false,
        "checkedOut": false,
        "room": 1, 
        "duration": 3 
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
*   **Response (404 Not Found):** If `user`, `room`, or any service ID does not exist.
*   **Serialization Group:** `booking`

#### 4. Update Booking

*   **Endpoint:** `PUT /bookings/{id}`
*   **Description:** Updates an existing booking. The price is recalculated on the backend.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the booking to update.
*   **Request Body:**
    ```json
    {
        "user": 1,
        "services": [3], 
        "checkIn": "YYYY-MM-DD HH:MM:SS",
        "checkOut": "YYYY-MM-DD HH:MM:SS",
        "checkedIn": true,
        "checkedOut": false,
        "room": 2, 
        "duration": 4 
    }
    ```
*   **Response (200 OK):**
    ```json
    {
        "id": 1, 
        "user": { /* User object */ },
        "services": [ { /* Service object for ID 3 */ } ],
        "checkIn": "YYYY-MM-DDTHH:MM:SS+00:00",
        "checkOut": "YYYY-MM-DDTHH:MM:SS+00:00",
        "checkedIn": true,
        "checkedOut": false,
        "room": { /* Room object for ID 2 */ },
        "price": "Recalculated_Price"
    }
    ```
*   **Response (404 Not Found):** If the booking, `user`, `room`, or any service ID does not exist.
*   **Serialization Group:** `booking`

#### 5. Delete Booking

*   **Endpoint:** `DELETE /bookings/{id}`
*   **Description:** Deletes a booking.
*   **Path Parameters:**
    *   `id` (integer, required): The ID of the booking to delete.
*   **Request Body:** None
*   **Response (204 No Content):** Successfully deleted.
*   **Response (404 Not Found):** If the booking does not exist. 