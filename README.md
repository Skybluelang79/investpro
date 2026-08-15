# InvestPro - Investment Platform

A full-stack investment management platform built with Laravel 11 and Angular 17, featuring real-time profit tracking, wallet management, KYC verification, and a comprehensive admin dashboard.

## ✨ Features

### For Users
- 🔐 **Secure Authentication** - Register, login, password management
- 💰 **Investment Management** - Multiple investment plans with automatic profit accrual
- 👛 **Wallet System** - Real-time balance updates and transaction history
- 💳 **Deposits & Withdrawals** - Multiple payment methods with admin approval
- ✅ **KYC Verification** - Document submission and verification workflow
- 👤 **User Profile** - Personal information and avatar management
- 📊 **Dashboard** - Real-time portfolio overview and performance charts
- 🎁 **Referral Program** - Earn bonuses by referring friends
- 🔔 **Notifications** - Real-time system notifications
- 📈 **Portfolio Tracking** - Monitor investment performance

### For Admins
- 👥 **User Management** - View, edit, and manage user accounts
- 📋 **Investment Plans** - Create and manage investment plans
- 💵 **Deposit Approval** - Review and approve user deposits
- 🏦 **Withdrawal Management** - Review and process withdrawals
- ✅ **KYC Verification** - Review and approve user documents
- 📊 **Analytics & Reports** - Platform performance and user statistics
- 🛡️ **Admin Dashboard** - Complete platform overview

## 🏗️ Architecture

### Technology Stack

**Backend:**
- PHP 8.2+
- Laravel 11
- MySQL 5.7+
- Laravel Sanctum (API authentication)
- Eloquent ORM

**Frontend:**
- Angular 17
- TypeScript 5.4
- RxJS 7.8
- Chart.js 4.4
- SCSS

**Deployment:**
- Docker support (coming soon)
- CI/CD ready

## 📦 Project Structure

```
investpro/
├── backend/                      # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/      # API endpoints
│   │   │   └── Middleware/       # Auth & CORS middleware
│   │   ├── Models/               # Database models
│   │   ├── Services/             # Business logic
│   │   └── Console/Commands/     # Artisan commands
│   ├── database/
│   │   ├── migrations/           # Database schema
│   │   └── seeders/              # Sample data
│   ├── routes/
│   │   └── api.php               # API routes
│   ├── storage/                  # File storage
│   ├── .env                      # Configuration
│   └── composer.json             # PHP dependencies
│
├── frontend/                     # Angular app
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/         # User-facing features
│   │   │   ├── admin/            # Admin panel
│   │   │   ├── core/             # Services & utilities
│   │   │   └── shared/           # Shared components
│   │   ├── environments/         # Config files
│   │   └── styles/               # Global styles
│   ├── angular.json              # Angular config
│   └── package.json              # Node dependencies
│
├── SETUP_GUIDE.md               # Installation guide
├── README.md                    # This file
├── setup.bat                    # Windows setup script
└── setup.sh                     # macOS/Linux setup script
```

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- MySQL 5.7+
- Node.js 18+
- Composer
- npm

### Installation

**Windows:**
```bash
cd investpro
setup.bat
```

**macOS/Linux:**
```bash
cd investpro
chmod +x setup.sh
./setup.sh
```

### Manual Setup

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed step-by-step instructions.

### Run Servers

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
# Backend: http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Frontend: http://localhost:4200
```

**Terminal 3 - Scheduler (required for profit accrual):**
```bash
cd backend
php artisan schedule:work
```

> The `investpro:accrue-profits` command (scheduled every minute) credits daily profits and matures investments. It only runs while the scheduler is running. In production use a cron entry instead:
> `* * * * * cd /path/to/investpro/backend && php artisan schedule:run >> /dev/null 2>&1`

### Docker Quick Start

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin).

```bash
cd investpro
docker compose up --build
```

| Service   | URL                        | Notes |
|-----------|----------------------------|-------|
| Frontend  | http://localhost:8080      | Nginx serving the Angular build |
| Backend   | http://localhost:8000/api  | Laravel API |
| MySQL     | localhost:3306             | Database `investpro`, user `investpro` |
| Scheduler | -                          | Runs `php artisan schedule:work` for profit accrual |

On first boot the backend runs `key:generate`, `migrate --seed`, and `storage:link` automatically. Use `docker compose down` to stop and `docker compose down -v` to reset the database.

> **Note:** Build the frontend against a specific API by replacing `apiBaseUrl` in `src/environments/environment.prod.ts` (or use the `staging` configuration: `npm run build -- --configuration staging`).

### Demo Login

**Admin Account:**
- Email: `admin@investpro.test`
- Password: `password123`

**Demo User:**
- Email: `demo@investpro.test`
- Password: `password`

## 📚 API Documentation

Complete API documentation is available at `/api/documentation` when the backend is running.

### Key Endpoints

**Authentication:**
```
POST   /api/v1/register              - User registration
POST   /api/v1/login                 - User login
POST   /api/v1/logout                - User logout (auth required)
GET    /api/v1/me                    - Get current user
```

**Investments:**
```
GET    /api/v1/plans                 - List investment plans
GET    /api/v1/investments           - List user investments
POST   /api/v1/investments           - Create investment
GET    /api/v1/investments/{id}      - Get investment details
```

**Wallet & Transactions:**
```
GET    /api/v1/wallet                - Get wallet info
GET    /api/v1/transactions          - List transactions
```

**Admin Routes:**
```
GET    /api/v1/admin/dashboard       - Admin dashboard data
GET    /api/v1/admin/users           - List users
GET    /api/v1/admin/deposits        - List deposits
GET    /api/v1/admin/withdrawals     - List withdrawals
GET    /api/v1/admin/kyc             - List KYC submissions
```

All admin routes require `Authorization: Bearer {token}` header and admin role.

## 🗄️ Database Schema

### Core Tables

**Users Table**
```sql
- id (PK)
- name
- email (unique)
- password
- phone
- avatar
- role (user|admin)
- is_active
- referral_code
- referred_by (FK)
- timestamps
```

**Wallets Table**
```sql
- id (PK)
- user_id (FK)
- balance (decimal)
- bonus (decimal)
- timestamps
```

**Investment Plans Table**
```sql
- id (PK)
- name
- description
- min_amount (decimal)
- max_amount (decimal)
- interest_rate (decimal)
- duration_days (int)
- badge
- is_active
- timestamps
```

**Investments Table**
```sql
- id (PK)
- user_id (FK)
- plan_id (FK)
- reference (unique)
- amount (decimal)
- current_value (decimal)
- total_profit (decimal)
- daily_profit (decimal)
- status (active|completed|rejected)
- starts_at
- ends_at
- next_payout_at
- timestamps
```

**Transactions Table**
```sql
- id (PK)
- user_id (FK)
- type (deposit|withdrawal|investment|profit|return|bonus)
- amount (decimal)
- balance_before (decimal)
- balance_after (decimal)
- reference (unique)
- description
- status (completed|failed|pending)
- timestamps
```

Additional tables: Deposits, Withdrawals, KycVerifications, Notifications

## 💡 Key Features Explained

### Investment & Profit System

1. **Investment Creation**
   - User selects a plan and enters amount
   - Amount deducted from wallet
   - Daily profit calculated as: `amount × (rate / 100)`

2. **Automatic Profit Accrual**
   - Profits calculated daily
   - Updated at midnight (UTC)
   - Can be manually triggered: `php artisan investpro:accrue-profits`

3. **Investment Completion**
   - When end date is reached
   - Current value credited to wallet
   - Investment marked as completed

### Wallet Management

- Real-time balance updates
- Separate bonus tracking
- Full transaction history
- Type-based filtering (deposits, investments, profits, etc.)

### KYC Verification

- Support for multiple document types (passport, ID, driver's license)
- Document upload with validation
- Admin review workflow
- Completion required for withdrawals

### Referral System

- Unique referral code per user
- Automatic bonuses on referral signup
- Bonus for referrer and referee
- Referral analytics on dashboard

## 🔐 Security

- Password hashing with bcrypt
- CSRF protection on all state-changing requests
- API rate limiting
- Input validation and sanitization
- CORS configured
- Sanctum token-based authentication
- Admin middleware protection
- File upload validation

## 📝 Configuration

### Backend (.env)

```env
APP_NAME=InvestPro
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:...

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=investpro
DB_USERNAME=root
DB_PASSWORD=

ADMIN_EMAIL=admin@investpro.test
ADMIN_PASSWORD=password123

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

## 🧪 Testing

### Run Tests

**Backend:**
```bash
cd backend
php artisan test
```

**Frontend:**
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment

```bash
cd backend

# Prepare for production
php artisan migrate --force
php artisan cache:clear
php artisan route:cache
php artisan config:cache
php artisan optimize

# Deploy with your hosting provider
```

### Frontend Deployment

```bash
cd frontend

# Build for production
npm run build

# Deploy dist/ folder to your web server
# Recommended: Vercel, Netlify, AWS S3 + CloudFront
```

### Recommended Hosting

- **Backend**: Heroku, Railway, DigitalOcean, AWS, Render
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: AWS RDS, DigitalOcean Database, Heroku Postgres

## 🐛 Troubleshooting

### Common Issues

**CORS Error**
```env
CORS_ALLOWED_ORIGINS=http://localhost:4200
SANCTUM_STATEFUL_DOMAINS=localhost:4200,localhost:8000
```

**Database Connection Failed**
- Ensure MySQL is running
- Check .env DB credentials
- Create database: `CREATE DATABASE investpro;`

**Port Already in Use**
```bash
# Backend on different port
php artisan serve --port=8001

# Frontend on different port
ng serve --port=4201
```

**Module Not Found (Frontend)**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more troubleshooting help.

## 📞 Support & Contributing

For issues or questions, please check:
1. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Installation & setup issues
2. Laravel Docs: https://laravel.com/docs
3. Angular Docs: https://angular.io/docs

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Development Team

Built with ❤️ using Laravel 11 & Angular 17

---

**Version:** 1.0.0  
**Last Updated:** August 14, 2026  
**Status:** Production Ready ✅

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)
