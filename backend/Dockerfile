FROM php:8.1-apache
WORKDIR /var/www/html
# Instalamos extensiones necesarias (ajusta según tus requerimientos)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip \
    unzip \
 && docker-php-ext-install pdo pdo_mysql

# Copiamos los archivos de Composer y los instalamos
COPY composer.json composer.lock ./
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --prefer-dist --optimize-autoloader

# Copiamos el resto de la aplicación Symfony
COPY . .

EXPOSE 80
CMD ["apache2-foreground"]