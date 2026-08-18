#!/usr/bin/env bash
set -eo pipefail

echo "==> Installing Composer dependencies..."
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

echo "==> Generating application key..."
php artisan key:generate --force

echo "==> Running migrations and seeding..."
php artisan migrate --force --seed

echo "==> Caching config and routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Build complete!"
