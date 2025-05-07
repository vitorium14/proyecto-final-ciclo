# Documentación de la API

## Índice
- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Habitaciones](#habitaciones)
- [Tipos de Habitación](#tipos-de-habitación)
- [Reservas](#reservas)
- [Servicios](#servicios)
- [Logs](#logs)

## Autenticación

La API utiliza autenticación basada en JWT (JSON Web Tokens). Todas las rutas requieren autenticación excepto las marcadas como públicas.

## Usuarios

### Crear Usuario Cliente
```http
POST /api/users/client
```

Crea un nuevo usuario con rol de cliente.

**Cuerpo de la petición:**
```json
{
    "email": "string",
    "password": "string",
    "name": "string",
    "surnames": "string"
}
```

### Crear Usuario Privilegiado
```http
POST /api/users/privileged
```

Crea un nuevo usuario con rol de administrador o empleado. Requiere rol de administrador.

**Cuerpo de la petición:**
```json
{
    "email": "string",
    "password": "string",
    "name": "string",
    "surnames": "string",
    "role": "ROLE_ADMIN | ROLE_EMPLOYEE"
}
```

### Listar Usuarios
```http
GET /api/users
```

Obtiene la lista de usuarios. Requiere rol de administrador.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Límite de resultados por página (default: 10, max: 50)
- `search`: Término de búsqueda
- `role`: Filtrar por rol

### Obtener Usuario
```http
GET /api/users/{id}
```

Obtiene los detalles de un usuario específico. Requiere rol de administrador.

### Actualizar Usuario
```http
PUT /api/users/{id}
```

Actualiza los datos de un usuario. Los usuarios solo pueden actualizar sus propios datos, excepto los administradores que pueden actualizar cualquier usuario.

**Cuerpo de la petición:**
```json
{
    "name": "string",
    "surnames": "string",
    "email": "string",
    "password": "string",
    "role": "string" // Solo para administradores
}
```

### Eliminar Usuario
```http
DELETE /api/users/{id}
```

Elimina un usuario. Requiere rol de administrador.

## Habitaciones

### Listar Habitaciones
```http
GET /api/rooms
```

Obtiene la lista de habitaciones.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Límite de resultados por página (default: 10, max: 50)
- `status`: Filtrar por estado
- `roomTypeId`: Filtrar por tipo de habitación
- `search`: Término de búsqueda

### Obtener Habitación
```http
GET /api/rooms/{id}
```

Obtiene los detalles de una habitación específica.

### Crear Habitación
```http
POST /api/rooms
```

Crea una nueva habitación. Requiere rol de administrador.

**Cuerpo de la petición:**
```json
{
    "number": "string",
    "roomType": {
        "id": "integer"
    },
    "status": "string"
}
```

### Actualizar Habitación
```http
PUT /api/rooms/{id}
```

Actualiza los datos de una habitación. Requiere rol de administrador.

**Cuerpo de la petición:**
```json
{
    "number": "string",
    "roomType": {
        "id": "integer"
    },
    "status": "string"
}
```

### Eliminar Habitación
```http
DELETE /api/rooms/{id}
```

Elimina una habitación. Requiere rol de administrador.

### Actualizar Estado de Habitación
```http
PATCH /api/rooms/status/{id}
```

Actualiza el estado de una habitación. Requiere rol de administrador.

**Cuerpo de la petición:**
```json
{
    "status": "string"
}
```

## Tipos de Habitación

### Listar Tipos de Habitación
```http
GET /api/room-types
```

Obtiene la lista de tipos de habitación.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Límite de resultados por página (default: 100, max: 50)
- `search`: Término de búsqueda

### Obtener Tipo de Habitación
```http
GET /api/room-types/{id}
```

Obtiene los detalles de un tipo de habitación específico.

### Crear Tipo de Habitación
```http
POST /api/room-types
```

Crea un nuevo tipo de habitación. Requiere rol de administrador.

**Cuerpo de la petición:**
```json
{
    "name": "string",
    "price": "number",
    "amenities": "array",
    "images": [
        {
            "image": "string",
            "isNew": true
        }
    ]
}
```

### Actualizar Tipo de Habitación
```http
PUT /api/room-types/{id}
```

Actualiza los datos de un tipo de habitación. Requiere rol de administrador.

**Cuerpo de la petición:**
```json
{
    "name": "string",
    "price": "number",
    "amenities": "array",
    "images": [
        {
            "id": "integer",
            "image": "string",
            "isNew": "boolean"
        }
    ]
}
```

### Eliminar Tipo de Habitación
```http
DELETE /api/room-types/{id}
```

Elimina un tipo de habitación. Requiere rol de administrador.

## Reservas

### Obtener Habitaciones Disponibles
```http
GET /api/reservations/available-rooms
```

Obtiene la lista de habitaciones disponibles para un rango de fechas.

**Parámetros de consulta:**
- `checkIn`: Fecha de entrada (YYYY-MM-DD)
- `checkOut`: Fecha de salida (YYYY-MM-DD)
- `roomTypeId`: ID del tipo de habitación (opcional)

### Listar Reservas
```http
GET /api/reservations
```

Obtiene la lista de reservas. Requiere rol de administrador.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Límite de resultados por página (default: 10)
- `status`: Filtrar por estado
- `startDate`: Fecha de inicio
- `endDate`: Fecha de fin

### Obtener Mis Reservas
```http
GET /api/reservations/my-reservations
```

Obtiene la lista de reservas del usuario actual.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Límite de resultados por página (default: 10)
- `status`: Filtrar por estado

### Obtener Reserva
```http
GET /api/reservations/{id}
```

Obtiene los detalles de una reserva específica. Solo el propietario de la reserva o un administrador pueden verla.

### Crear Reserva
```http
POST /api/reservations
```

Crea una nueva reserva.

**Cuerpo de la petición:**
```json
{
    "roomId": "integer",
    "checkIn": "string (YYYY-MM-DD)",
    "checkOut": "string (YYYY-MM-DD)",
    "observations": "string",
    "services": [
        {
            "id": "integer",
            "quantity": "integer"
        }
    ]
}
```

### Actualizar Reserva
```http
PUT /api/reservations/{id}
```

Actualiza los datos de una reserva. Solo el propietario de la reserva o un administrador pueden actualizarla.

**Cuerpo de la petición:**
```json
{
    "checkIn": "string (YYYY-MM-DD)",
    "checkOut": "string (YYYY-MM-DD)",
    "observations": "string",
    "services": [
        {
            "id": "integer",
            "quantity": "integer"
        }
    ]
}
```

### Cancelar Reserva
```http
POST /api/reservations/{id}/cancel
```

Cancela una reserva existente. Solo el propietario de la reserva o un administrador pueden cancelarla.

## Servicios

### Listar Servicios
```http
GET /api/services
```

Obtiene la lista de servicios.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Límite de resultados por página (default: 10, max: 50)
- `search`: Término de búsqueda
- `category`: Filtrar por categoría
- `status`: Filtrar por estado

### Obtener Servicio
```http
GET /api/services/{id}
```

Obtiene los detalles de un servicio específico.

### Crear Servicio
```http
POST /api/services
```

Crea un nuevo servicio. Requiere rol de administrador.

**Cuerpo de la petición:**
```json
{
    "name": "string",
    "price": "number",
    "category": "string",
    "description": "string",
    "status": "string"
}
```

### Actualizar Servicio
```http
PUT /api/services/{id}
```

Actualiza los datos de un servicio. Requiere rol de administrador.

**Cuerpo de la petición:**
```json
{
    "name": "string",
    "price": "number",
    "category": "string",
    "description": "string",
    "status": "string"
}
```

### Eliminar Servicio
```http
DELETE /api/services/{id}
```

Elimina un servicio. Requiere rol de administrador.

### Actualizar Estado de Servicio
```http
PATCH /api/services/{id}/status
```

Actualiza el estado de un servicio. Requiere rol de administrador.

**Cuerpo de la petición:**
```json
{
    "status": "string"
}
```

## Logs

### Listar Logs
```http
GET /api/logs
```

Obtiene la lista de logs del sistema. Requiere rol de administrador.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Límite de resultados por página (default: 10)
- `userId`: Filtrar por usuario
- `action`: Filtrar por acción
- `entityType`: Filtrar por tipo de entidad
- `entityId`: Filtrar por ID de entidad
- `startDate`: Fecha de inicio
- `endDate`: Fecha de fin 