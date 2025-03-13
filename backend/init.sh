#!/bin/bash

bin/console doctrine:database:create --if-not-exists
bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration
apache2-foreground