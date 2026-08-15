@echo off
REM InvestPro Setup Script for Windows

echo.
echo ========================================
echo   InvestPro - Complete Setup Script
echo ========================================
echo.

REM Check PHP
echo Checking for PHP installation...
php -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: PHP is not installed or not in PATH
    echo Please install PHP 8.2+ from https://www.php.net/downloads
    pause
    exit /b 1
)
echo [OK] PHP found

REM Check Composer
echo Checking for Composer...
composer --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Composer is not installed
    echo Please install from https://getcomposer.org/download/
    pause
    exit /b 1
)
echo [OK] Composer found

REM Check Node.js
echo Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

echo.
echo ========================================
echo   Step 1: Installing Backend Dependencies
echo ========================================
cd backend
call composer install
if errorlevel 1 (
    echo ERROR: Composer install failed
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

echo.
echo ========================================
echo   Step 2: Generating App Key
echo ========================================
php artisan key:generate
echo [OK] App key generated

echo.
echo ========================================
echo   Step 3: Running Database Migrations
echo ========================================
echo Creating database 'investpro' in MySQL...
echo Make sure MySQL is running and accessible.
echo.
php artisan migrate --force
if errorlevel 1 (
    echo WARNING: Migration failed. Make sure:
    echo  - MySQL is running
    echo  - Database 'investpro' exists
    echo  - .env has correct DB credentials
)
echo.

echo ========================================
echo   Step 4: Seeding Database
echo ========================================
php artisan db:seed --force
echo [OK] Database seeded with sample data

cd ..

echo.
echo ========================================
echo   Step 5: Installing Frontend Dependencies
echo ========================================
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed

cd ..

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Start Backend Server (Terminal 1):
echo    cd backend
echo    php artisan serve
echo.
echo 2. Start Frontend Dev Server (Terminal 2):
echo    cd frontend
echo    npm start
echo.
echo 3. Open browser: http://localhost:4200
echo.
echo 4. Login with demo account:
echo    Email: admin@investpro.test
echo    Password: password123
echo.
echo For more details, see SETUP_GUIDE.md
echo.
pause
