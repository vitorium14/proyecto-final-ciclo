#!/bin/bash

# Crear base de datos (si no existe)
php bin/console doctrine:database:create --if-not-exists

# Ejecutar migraciones
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

# Iniciar Apache en primer plano
apache2-foreground
