# Usar una imagen base de Node para construir Angular
FROM node:20 AS build-stage

# Crear el directorio de la app
WORKDIR /app

# Copiar el package.json y package-lock.json para instalar dependencias
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY frontend/. .

# Compilar la aplicación Angular para producción
RUN npm run build --prod

# Servir la aplicación usando nginx
FROM nginx:1.23-alpine AS production-stage
COPY --from=build-stage /app/dist/frontend/browser/ /usr/share/nginx/html

# Asignar permisos
RUN chmod -R 775 /usr/share/nginx/html

# Exponer el puerto
EXPOSE 80

# Arrancar nginx
CMD ["nginx", "-g", "daemon off;"]