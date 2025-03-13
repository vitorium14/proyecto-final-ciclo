FROM php:8.2-apache
WORKDIR /var/www/html
# Instalamos extensiones necesarias (ajusta según tus requerimientos)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_mysql

# install composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php && \
    php -r "unlink('composer-setup.php');" && \
    mv composer.phar /usr/local/bin/composer

# Copiamos el resto de la aplicación Symfony
COPY . .

EXPOSE 80

ENTRYPOINT ["./init.sh"]