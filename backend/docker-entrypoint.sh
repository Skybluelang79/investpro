#!/bin/bash
set -e

echo "==> Generating application key..."
php artisan key:generate --force

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Seeding database..."
php artisan db:seed --force || echo "==> Seeding skipped (already seeded or error)"

echo "==> Creating storage link..."
php artisan storage:link 2>/dev/null || true

echo "==> Starting server..."
exec php artisan serve --host=0.0.0.0 --port=8000
