# InvestPro - Quick Start Checklist ✅

Use this checklist to get InvestPro up and running in minutes.

## Prerequisites Installation

- [ ] **PHP 8.2+** installed
  - Download: https://www.php.net/downloads
  - Verify: `php -v`

- [ ] **MySQL 5.7+** installed and running
  - Download: https://www.mysql.com/downloads
  - Verify: `mysql -u root -p`

- [ ] **Composer** installed
  - Download: https://getcomposer.org/download
  - Verify: `composer --version`

- [ ] **Node.js 18+** and npm installed
  - Download: https://nodejs.org
  - Verify: `node --version && npm --version`

## Automatic Setup (Recommended)

### Windows
```bash
cd investpro
setup.bat
```

### macOS/Linux
```bash
cd investpro
chmod +x setup.sh
./setup.sh
```

**The script will:**
- ✅ Verify all prerequisites
- ✅ Install PHP dependencies
- ✅ Generate app key
- ✅ Run database migrations
- ✅ Seed demo data
- ✅ Install Node dependencies

## Manual Setup (If automatic fails)

### Step 1: Backend Setup
```bash
cd backend
composer install
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install
```

## Start Development Servers

### Terminal 1 - Backend
```bash
cd backend
php artisan serve
# Runs at: http://localhost:8000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
# Runs at: http://localhost:4200
```

## Test the Installation

- [ ] Open http://localhost:4200 in browser
- [ ] Should see login page
- [ ] Login with demo credentials:
  - Email: `admin@investpro.test`
  - Password: `password123`
- [ ] Should see admin dashboard
- [ ] Check backend logs: `backend/storage/logs/laravel.log`
- [ ] Check frontend console: Press `F12` → Console tab

## Demo Accounts

### Admin Account
```
Email: admin@investpro.test
Password: password123
Role: Admin
Access: Full admin panel
```

### Demo User Account
```
Email: demo@investpro.test
Password: password
Role: User
Balance: $25,000
Investment: $10,000 in Growth Plan
```

## Key Features to Test

- [ ] **Login** - Try both accounts
- [ ] **Dashboard** - View portfolio overview
- [ ] **Investments** - Create new investment
- [ ] **Wallet** - Check balance and transactions
- [ ] **Profile** - Update user information
- [ ] **Admin Panel** - Access user/deposit management

## Common Issues & Solutions

### Issue: "composer: command not found"
```bash
# Add Composer to PATH or use full path
# Windows: C:\ProgramData\Composer\bin\composer.phar
# Try: php composer.phar install
```

### Issue: "Mysql connection refused"
```bash
# Start MySQL service
# Windows: Start XAMPP Control Panel
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Issue: "Cannot find module" in Angular
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port already in use"
```bash
# Backend on different port
php artisan serve --port=8001

# Frontend on different port
ng serve --port=4201
```

## Project Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `API_REFERENCE.md` | Complete API documentation |
| `.env` | Backend configuration |
| `setup.bat` | Windows automated setup |
| `setup.sh` | macOS/Linux automated setup |

## Next Steps

1. ✅ Follow checklist above
2. ✅ Verify both servers running
3. ✅ Login to dashboard
4. ✅ Explore all features
5. ✅ Read `SETUP_GUIDE.md` for detailed info
6. ✅ Check `API_REFERENCE.md` for API endpoints

## Backend API

Base URL: `http://localhost:8000/api/v1`

Key endpoints:
- `POST /login` - User login
- `GET /dashboard` - Dashboard data
- `GET /investments` - List investments
- `POST /investments` - Create investment
- `GET /wallet` - Wallet info
- `GET /admin/*` - Admin endpoints (admin only)

See `API_REFERENCE.md` for complete API documentation.

## Documentation

- **Setup Guide**: `SETUP_GUIDE.md` - Installation & configuration
- **Project README**: `README.md` - Features & architecture
- **API Reference**: `API_REFERENCE.md` - All API endpoints
- **This File**: Quick setup & troubleshooting

## Database

### Tables Created
- users
- wallets
- investment_plans (4 plans seeded)
- investments (demo investment included)
- deposits
- withdrawals
- transactions
- kyc_verifications
- notifications
- personal_access_tokens

Database: `investpro`
Host: `localhost`
Port: `3306`

## Support

1. Check troubleshooting section above
2. Review `SETUP_GUIDE.md` for detailed help
3. Check logs:
   - Backend: `backend/storage/logs/laravel.log`
   - Frontend: Browser console (`F12`)
4. Consult official docs:
   - Laravel: https://laravel.com/docs
   - Angular: https://angular.io/docs

## Environment Variables

### .env Configuration
```
DB_HOST=127.0.0.1
DB_DATABASE=investpro
DB_USERNAME=root
DB_PASSWORD=

ADMIN_EMAIL=admin@investpro.test
ADMIN_PASSWORD=password123

CORS_ALLOWED_ORIGINS=http://localhost:4200
```

### environment.ts Configuration
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000/api/v1'
};
```

---

**Ready to Start?**

Run setup.bat (Windows) or setup.sh (macOS/Linux) and follow the prompts!

Then navigate to: **http://localhost:4200**

---

Version: 1.0.0
Last Updated: August 14, 2026
