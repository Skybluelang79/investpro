#!/bin/bash

# InvestPro Setup Script for macOS/Linux

set -e

echo ""
echo "========================================"
echo "  InvestPro - Complete Setup Script"
echo "========================================"
echo ""

# Check PHP
echo "Checking for PHP installation..."
if ! command -v php &> /dev/null; then
    echo "ERROR: PHP is not installed"
    echo "Please install PHP 8.2+ from https://www.php.net/downloads"
    exit 1
fi
echo "[OK] PHP found"

# Check Composer
echo "Checking for Composer..."
if ! command -v composer &> /dev/null; then
    echo "ERROR: Composer is not installed"
    echo "Please install from https://getcomposer.org/download/"
    exit 1
fi
echo "[OK] Composer found"

# Check Node.js
echo "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install from https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js found"

echo ""
echo "========================================"
echo "  Step 1: Installing Backend Dependencies"
echo "========================================"
cd backend
composer install
echo "[OK] Backend dependencies installed"

echo ""
echo "========================================"
echo "  Step 2: Generating App Key"
echo "========================================"
php artisan key:generate
echo "[OK] App key generated"

echo ""
echo "========================================"
echo "  Step 3: Running Database Migrations"
echo "========================================"
echo "Creating database 'investpro' in MySQL..."
echo "Make sure MySQL is running and accessible."
echo ""
php artisan migrate --force
echo "[OK] Database migrations completed"

echo ""
echo "========================================"
echo "  Step 4: Seeding Database"
echo "========================================"
php artisan db:seed --force
echo "[OK] Database seeded with sample data"

cd ..

echo ""
echo "========================================"
echo "  Step 5: Installing Frontend Dependencies"
echo "========================================"
cd frontend
npm install
echo "[OK] Frontend dependencies installed"

cd ..

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start Backend Server (Terminal 1):"
echo "   cd backend"
echo "   php artisan serve"
echo ""
echo "2. Start Frontend Dev Server (Terminal 2):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Open browser: http://localhost:4200"
echo ""
echo "4. Login with demo account:"
echo "   Email: admin@investpro.test"
echo "   Password: password123"
echo ""
echo "For more details, see SETUP_GUIDE.md"
echo ""
