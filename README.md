# 🏨 Hotel Management WebApp

## 📌 Descripción

Esta es una **webapp** desarrollada con **Angular** y **Symfony** para la gestión de un hotel. La aplicación ofrece dos áreas principales:

- **Parte pública:** Permite a los clientes consultar información sobre el hotel, tipos de habitaciones y realizar reservas.
- **Parte privada:** Accesible mediante autenticación, permite a los trabajadores y administradores gestionar las reservas, realizar check-in/check-out y administrar clientes.

## ⚙️ Tecnologías utilizadas

- **Frontend:** Angular
- **Backend:** Symfony
- **Estilos:** Bootstrap, Bootstrap Icons
- **Despliegue:** Docker, Docker Compose
- **Metodología:** SCRUM

## 🎯 Funcionalidades

### 🏠 Parte pública

✅ Página de inicio moderna y centrada en UX  
✅ Información sobre el hotel, tipos de habitaciones y precios  
✅ Formulario para realizar reservas

### 🔒 Parte privada

✅ Login para trabajadores y administradores  
✅ Gestión de check-in y check-out  
✅ Registro y administración de clientes

## 🖌️ Diseño

- Diseño **moderno y centrado en UX**
- Paleta de colores **monocroma anaranjada**
- Consistencia en el diseño del **header** y **footer**

## 🏗️ Instalación y configuración

### 1. **Clonar el repositorio**

```bash
git clone https://github.com/vitorium14/proyecto-final-ciclo.git
cd proyecto-final-ciclo
```

### 2. **Instalar dependencias**

```bash
npm install
```

### 3. **Instalar dependencias Symfony**

```bash
composer install
```

### 4. **Ejecutar el proyecto en modo desarrollo**

```bash
ng serve
```

La aplicación estará disponible en **[http://localhost:4200](http://localhost:4200)**.

### 5. **Ejecutar el backend Symfony**

```bash
symfony serve
```

La API estará disponible en **[http://localhost:8000](http://localhost:8000)**.

### 6. **Desplegar con Docker**

1. Construir las imágenes de Docker:

```bash
docker-compose build
```

2. Levantar los servicios:

```bash
docker-compose up
```

La aplicación estará disponible en **[http://localhost:3000](http://localhost:3000)**.

## 🧪 **Testing**

Para ejecutar las pruebas unitarias:

```bash
ng test
```

Para ejecutar las pruebas del backend Symfony:

```bash
php bin/phpunit
```

## 📂 **Estructura de carpetas**

```bash
src/
├── app/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── models/
├── assets/
├── environments/
├── styles/
backend/
├── config/
├── src/
├── templates/
├── tests/
└── var/
```

## ✅ **Estado del proyecto**

🚧 En desarrollo

## 👨‍💻 **Autor**

- **Víctor Giménez Gil** – [GitHub](https://github.com/tu-usuario)

---

💡 ¡Contribuciones y sugerencias son bienvenidas! 😎
