# InvestPro - Complete Setup & Installation Guide

## 📋 Project Overview

InvestPro is a complete investment platform with:
- **Backend**: Laravel 11 RESTful API with Sanctum authentication
- **Frontend**: Angular 17 standalone components
- **Database**: MySQL
- **Features**: Investment management, wallet system, KYC verification, admin dashboard, referral system

---

## 🛠️ Prerequisites

Before you begin, ensure you have installed:

1. **PHP 8.2+**
   - Download from: https://www.php.net/downloads
   - Windows: Use XAMPP or standalone PHP
   - Verify: `php -v`

2. **MySQL/MariaDB 5.7+**
   - Download from: https://www.mysql.com/downloads/
   - Create a database named `investpro`
   - Verify: `mysql -u root -p`

3. **Composer** (PHP dependency manager)
   - Download from: https://getcomposer.org/download/
   - Verify: `composer --version`

4. **Node.js 18+ & npm**
   - Download from: https://nodejs.org/
   - Verify: `node --version && npm --version`

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Backend Dependencies

```bash
cd backend
composer install
```

### Step 2: Set up Database

```bash
# Configure MySQL connection in .env (already set up)
# Create database
mysql -u root -p -e "CREATE DATABASE investpro;"

# Run migrations
php artisan migrate

# Seed sample data
php artisan db:seed
```

**Default Test Accounts:**
- Admin: `admin@investpro.test` / `password123`
- User: `demo@investpro.test` / `password`

### Step 3: Start Backend Server

```bash
# Terminal 1
cd backend
php artisan serve
```

The backend will run at: **http://localhost:8000**

### Step 4: Install Frontend Dependencies

```bash
# Terminal 2
cd frontend
npm install
```

### Step 5: Start Frontend Dev Server

```bash
cd frontend
npm start
```

The frontend will run at: **http://localhost:4200**

---

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/v1/register              - Register new user
POST   /api/v1/login                 - Login user
POST   /api/v1/logout                - Logout (requires auth)
GET    /api/v1/me                    - Get current user
```

### Investment Endpoints

```
GET    /api/v1/plans                 - List all investment plans
GET    /api/v1/plans/{id}            - Get plan details
GET    /api/v1/investments           - List user investments
POST   /api/v1/investments           - Create new investment
GET    /api/v1/investments/{id}      - Get investment details
```

### Wallet Endpoints

```
GET    /api/v1/wallet                - Get wallet info
GET    /api/v1/transactions          - List transactions
```

### Deposit/Withdrawal Endpoints

```
GET    /api/v1/deposits              - List deposits
POST   /api/v1/deposits              - Submit deposit
GET    /api/v1/withdrawals           - List withdrawals
POST   /api/v1/withdrawals           - Request withdrawal
```

### KYC Endpoints

```
GET    /api/v1/kyc                   - Get KYC status
POST   /api/v1/kyc                   - Submit KYC verification
```

---

## 🏗️ Project Structure

```
investpro/
├── backend/                          # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/        # API controllers
│   │   ├── Models/                  # Database models
│   │   └── Services/                # Business logic
│   ├── database/
│   │   ├── migrations/              # Database schema
│   │   └── seeders/                 # Sample data
│   ├── routes/api.php               # API routes
│   └── .env                         # Configuration
│
└── frontend/                         # Angular app
    ├── src/
    │   ├── app/
    │   │   ├── features/            # User pages
    │   │   ├── admin/               # Admin panel
    │   │   ├── core/                # Services & guards
    │   │   └── shared/              # Reusable components
    │   └── environments/            # Config for build
    └── package.json
```

---

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts with referral system
- **wallets** - User wallet balances
- **investment_plans** - Investment plan templates
- **investments** - User investments with profit tracking
- **deposits** - Deposit requests
- **withdrawals** - Withdrawal requests
- **transactions** - All financial transactions
- **notifications** - System notifications
- **kyc_verifications** - KYC documents and status

---

## 🔄 Key Features

### 1. Investment System
- Multiple investment plans with different rates
- Automatic daily profit accrual
- Real-time profit tracking
- Investment completion automation

### 2. Wallet System
- Real-time balance updates
- Bonus tracking
- Transaction history
- Multi-currency support (can be added)

### 3. KYC Verification
- Document upload
- Admin verification workflow
- Withdrawal restrictions until approved

### 4. Referral Program
- Unique referral codes
- Automatic referral bonuses
- Referral tracking dashboard

### 5. Admin Panel
- User management
- Investment plan configuration
- Deposit/Withdrawal approval
- KYC verification
- Platform analytics

---

## ⚙️ Configuration

### Backend (.env)

```env
# Database
DB_HOST=127.0.0.1
DB_DATABASE=investpro
DB_USERNAME=root
DB_PASSWORD=

# Admin Account
ADMIN_EMAIL=admin@investpro.test
ADMIN_PASSWORD=password123

# Frontend CORS
CORS_ALLOWED_ORIGINS=http://localhost:4200
SANCTUM_STATEFUL_DOMAINS=localhost:4200,localhost:8000
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000/api/v1',
};
```

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend
php artisan test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🚢 Production Deployment

### Backend (Laravel)

```bash
# Prepare for production
php artisan optimize
php artisan cache:clear
php artisan route:cache
php artisan config:cache

# Build static assets
npm run build  # if using npm for frontend assets
```

### Frontend (Angular)

```bash
cd frontend
npm run build

# Output: frontend/dist/
# Deploy the dist folder to your web server
```

**Recommended Hosting:**
- Backend: Heroku, Railway, DigitalOcean, AWS
- Frontend: Vercel, Netlify, AWS S3 + CloudFront

---

## 🐛 Troubleshooting

### Issue: "CORS error" in frontend

**Solution:**
```env
# Backend .env
CORS_ALLOWED_ORIGINS=http://localhost:4200
SANCTUM_STATEFUL_DOMAINS=localhost:4200,localhost:8000
```

### Issue: "No application key has been specified"

**Solution:**
```bash
cd backend
php artisan key:generate
```

### Issue: "Cannot find module" in Angular

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: MySQL connection refused

**Solution:**
```bash
# Start MySQL service
# Windows: Check XAMPP control panel
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql

# Test connection
mysql -u root -p
```

---

## 📊 Profit Accrual System

Profits are calculated daily at midnight (UTC):

```
Daily Profit = Investment Amount × (Interest Rate / 100)
```

Example:
- Investment: $10,000
- Plan Rate: 1.25% daily
- Daily Profit: $125
- Monthly Profit: ~$3,750 (30 days)

**Accrual Command:**
```bash
php artisan schedule:run
# Or manually:
php artisan acrue:profits
```

---

## 📧 Email Notifications

Default: Log driver (outputs to logs/laravel.log)

To enable real email:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS=noreply@investpro.test
```

---

## 🔐 Security Best Practices

1. **Never commit .env** - It contains secrets
2. **Use strong passwords** - Min 12 characters
3. **Enable HTTPS** - Use SSL certificates in production
4. **Validate inputs** - All inputs are validated server-side
5. **Rate limiting** - API has built-in rate limiting
6. **CSRF protection** - Enabled on all state-changing requests

---

## 📱 Frontend Routes

| Route | Purpose | Auth Required |
|-------|---------|--------------|
| /auth/login | User login | No |
| /auth/register | New account | No |
| /dashboard | Main dashboard | Yes |
| /investments | Investment management | Yes |
| /wallet | Wallet & transactions | Yes |
| /deposits | Deposit history | Yes |
| /withdrawals | Withdrawal requests | Yes |
| /kyc | KYC verification | Yes |
| /profile | User profile | Yes |
| /admin/* | Admin panel | Yes + Admin role |

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Set up database
3. ✅ Start both servers
4. ✅ Test login with demo account
5. ✅ Explore features
6. ✅ Customize investment plans (Admin panel)
7. ✅ Deploy to production

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review Laravel docs: https://laravel.com/docs
3. Review Angular docs: https://angular.io/docs
4. Check application logs:
   - Backend: `backend/storage/logs/laravel.log`
   - Frontend: Browser console (F12)

---

**Built with ❤️ using Laravel 11 & Angular 17**

Version: 1.0.0
Last Updated: 2026-08-14
