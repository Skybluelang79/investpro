FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache \
        curl \
        oniguruma-dev \
        libzip-dev \
        icu-dev \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        bcmath \
        pcntl \
        opcache \
        intl \
    && docker-php-ext-enable opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN mkdir -p \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/framework/testing \
        storage/logs \
        bootstrap/cache \
    && composer install --no-interaction --prefer-dist --no-dev \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
