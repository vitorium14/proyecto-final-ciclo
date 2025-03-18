# Usar una imagen base de PHP con Apache
FROM php:8.2-apache

# Configurar el DocumentRoot a la carpeta `public`
RUN sed -i -e 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf
RUN sed -i -e 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Instalar extensiones de PHP y dependencias
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    mariadb-client \
    && docker-php-ext-install pdo pdo_mysql zip

# Habilitar mod_rewrite para Symfony
RUN a2enmod rewrite

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Crear el directorio de trabajo
WORKDIR /var/www/html

# Copiar el código fuente
COPY backend/. .

# Instalar las dependencias de Symfony
RUN composer install --no-interaction --no-progress --optimize-autoloader

# Asignar permisos
RUN chown -R www-data:www-data /var
RUN chmod -R 775 /var

# Exponer el puerto
EXPOSE 80

# Ejecutar el servidor de Symfony
ENTRYPOINT ["./init.sh"]