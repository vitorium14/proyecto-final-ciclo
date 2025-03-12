# Etapa 1: Construir la aplicación Angular
FROM node:14 AS builder
WORKDIR /app
# Copiamos los archivos de dependencias
COPY package.json package-lock.json angular.json ./
RUN npm install
# Copiamos el resto del código y compilamos la app
COPY . .
RUN npm run build --prod

# Etapa 2: Servir los archivos estáticos con Nginx
FROM nginx:alpine
# Copiamos el resultado del build (ajusta "mi-app" por el nombre real del directorio de salida)
COPY --from=builder /app/dist/mi-app /usr/share/nginx/html
# Copiamos la configuración personalizada de Nginx (para manejar, por ejemplo, el proxy hacia el backend)
COPY ../nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]