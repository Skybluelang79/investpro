# InvestPro - API Quick Reference

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer {token}
```

Token is received after login.

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "password_confirmation": "secure123",
  "phone": "+1234567890",
  "referral_code": "OPTIONAL"
}

Response: 201 Created
{
  "token": "...",
  "user": { /* user object */ }
}
```

### Login User
```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}

Response: 200 OK
{
  "token": "...",
  "user": { /* user object */ }
}
```

### Get Current User
```http
GET /me
Authorization: Bearer {token}

Response: 200 OK
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "wallet": { /* wallet object */ },
    "kyc": { /* kyc object */ }
  }
}
```

### Logout
```http
POST /logout
Authorization: Bearer {token}

Response: 200 OK
{ "message": "Logged out successfully" }
```

---

## 💰 Dashboard Endpoint

### Get Dashboard Data
```http
GET /dashboard
Authorization: Bearer {token}

Response: 200 OK
{
  "total_balance": 50000.00,
  "total_invested": 30000.00,
  "active_invested": 20000.00,
  "total_profit": 5000.00,
  "bonus_balance": 500.00,
  "referral_bonus_earned": 1000.00,
  "referrals_count": 5,
  "referral_code": "USER12345",
  "monthly_growth": 12.5,
  "chart": [
    { "month": "Jul", "value": 15000 },
    { "month": "Aug", "value": 20000 }
  ],
  "referral_chart": [
    { "month": "Jul", "referrals": 2, "bonus": 20 }
  ]
}
```

---

## 📋 Investment Plans

### List All Plans
```http
GET /plans

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "name": "Starter Plan",
      "description": "Perfect for new investors",
      "min_amount": 100,
      "max_amount": 999,
      "interest_rate": 0.50,
      "duration_days": 30,
      "badge": "Beginner",
      "is_active": true
    }
  ]
}
```

### Get Plan Details
```http
GET /plans/{id}

Response: 200 OK
{ "data": { /* plan object */ } }
```

---

## 💼 Investments

### List User Investments
```http
GET /investments?per_page=15
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "plan_id": 1,
      "amount": 10000.00,
      "current_value": 11250.00,
      "total_profit": 1250.00,
      "daily_profit": 125.00,
      "status": "active",
      "starts_at": "2024-08-01T00:00:00Z",
      "ends_at": "2024-09-30T00:00:00Z",
      "next_payout_at": "2024-08-15T00:00:00Z",
      "plan": { /* plan object */ }
    }
  ],
  "pagination": { "total": 5, "per_page": 15, "page": 1 }
}
```

### Create Investment
```http
POST /investments
Authorization: Bearer {token}
Content-Type: application/json

{
  "plan_id": 1,
  "amount": 10000.00
}

Response: 201 Created
{
  "message": "Investment created successfully.",
  "investment": { /* investment object */ }
}
```

### Get Investment Details
```http
GET /investments/{id}
Authorization: Bearer {token}

Response: 200 OK
{ "investment": { /* investment object */ } }
```

---

## 👛 Wallet

### Get Wallet Info
```http
GET /wallet
Authorization: Bearer {token}

Response: 200 OK
{
  "wallet": {
    "id": 1,
    "user_id": 1,
    "balance": 50000.00,
    "bonus": 500.00,
    "created_at": "2024-08-01T00:00:00Z",
    "updated_at": "2024-08-14T12:30:00Z"
  }
}
```

---

## 📊 Transactions

### List Transactions
```http
GET /transactions?per_page=15&type=deposit
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "type": "deposit",
      "amount": 5000.00,
      "balance_before": 45000.00,
      "balance_after": 50000.00,
      "description": "User deposit",
      "reference": "DEP-ABC123",
      "status": "completed",
      "created_at": "2024-08-14T10:00:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Get Transaction Details
```http
GET /transactions/{id}
Authorization: Bearer {token}

Response: 200 OK
{ "transaction": { /* transaction object */ } }
```

---

## 💳 Deposits

### List Deposits
```http
GET /deposits?per_page=15
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "amount": 5000.00,
      "method": "Bank Transfer",
      "status": "pending",
      "reference": "DEP-ABC123",
      "created_at": "2024-08-14T10:00:00Z"
    }
  ]
}
```

### Submit Deposit
```http
POST /deposits
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 5000.00,
  "method": "Bank Transfer",
  "account_details": {
    "account_number": "1234567890",
    "bank_name": "ABC Bank"
  }
}

Response: 201 Created
{
  "message": "Deposit submitted. Awaiting confirmation.",
  "deposit": { /* deposit object */ }
}
```

### Get Deposit Details
```http
GET /deposits/{id}
Authorization: Bearer {token}

Response: 200 OK
{ "deposit": { /* deposit object */ } }
```

---

## 💸 Withdrawals

### List Withdrawals
```http
GET /withdrawals?per_page=15
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "amount": 5000.00,
      "method": "Bank Transfer",
      "status": "pending",
      "reference": "WDR-XYZ789",
      "created_at": "2024-08-14T10:00:00Z"
    }
  ]
}
```

### Request Withdrawal
```http
POST /withdrawals
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 5000.00,
  "method": "Bank Transfer",
  "account_details": {
    "account_number": "1234567890",
    "account_name": "John Doe",
    "bank_name": "ABC Bank",
    "swift_code": "ABCDEFGH"
  }
}

Response: 201 Created
{
  "message": "Withdrawal requested. Awaiting approval.",
  "withdrawal": { /* withdrawal object */ }
}
```

### Get Withdrawal Details
```http
GET /withdrawals/{id}
Authorization: Bearer {token}

Response: 200 OK
{ "withdrawal": { /* withdrawal object */ } }
```

---

## ✅ KYC Verification

### Get KYC Status
```http
GET /kyc
Authorization: Bearer {token}

Response: 200 OK
{
  "kyc": {
    "id": 1,
    "document_type": "passport",
    "status": "pending",
    "document_front": "/path/to/image",
    "document_back": "/path/to/image"
  }
}
```

### Submit KYC
```http
POST /kyc
Authorization: Bearer {token}
Content-Type: multipart/form-data

document_type: passport
document_number: AB123456
document_front: [file]
document_back: [file]

Response: 201 Created
{
  "message": "KYC submitted for review.",
  "kyc": { /* kyc object */ }
}
```

---

## 👤 Profile

### Get Profile
```http
GET /profile
Authorization: Bearer {token}

Response: 200 OK
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "avatar": "/path/to/avatar.jpg",
    "wallet": { /* wallet object */ },
    "kyc": { /* kyc object */ }
  }
}
```

### Update Profile
```http
PUT /profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "newemail@example.com",
  "phone": "+1234567890"
}

Response: 200 OK
{
  "message": "Profile updated.",
  "user": { /* updated user object */ }
}
```

### Update Password
```http
PUT /profile/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "old_password",
  "password": "new_password",
  "password_confirmation": "new_password"
}

Response: 200 OK
{ "message": "Password updated." }
```

### Upload Avatar
```http
POST /profile/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

avatar: [image file]

Response: 200 OK
{
  "message": "Avatar updated.",
  "avatar": "/path/to/avatar.jpg"
}
```

---

## 🔔 Notifications

### List Notifications
```http
GET /notifications?per_page=15
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "title": "Investment started",
      "message": "Your investment is now active",
      "type": "success",
      "read_at": null,
      "created_at": "2024-08-14T10:00:00Z"
    }
  ]
}
```

### Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer {token}

Response: 200 OK
{ "unread_count": 5 }
```

### Mark as Read
```http
POST /notifications/{id}/read
Authorization: Bearer {token}

Response: 200 OK
{ "message": "Notification marked as read." }
```

### Mark All as Read
```http
POST /notifications/read-all
Authorization: Bearer {token}

Response: 200 OK
{ "message": "All notifications marked as read." }
```

---

## 👨‍💼 Admin Endpoints

All admin endpoints require `Authorization: Bearer {token}` and admin role.

### Admin Dashboard
```http
GET /admin/dashboard
Authorization: Bearer {token}

Response: 200 OK
{
  "total_balance": 1000000.00,
  "total_invested": 500000.00,
  "total_profit": 50000.00,
  "total_bonus_paid": 10000.00,
  "total_referrals": 250,
  "pending_deposits": 5,
  "pending_withdrawals": 3
}
```

### List Users
```http
GET /admin/users?search=john&per_page=15
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [ /* user objects */ ]
}
```

### Get User Details
```http
GET /admin/users/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "user": {
    /* user with all related data */
  }
}
```

### List Investment Plans
```http
GET /admin/plans
Authorization: Bearer {token}

Response: 200 OK
{
  "plans": [ /* plan objects */ ]
}
```

### Create Investment Plan
```http
POST /admin/plans
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Premium Plan",
  "description": "For premium investors",
  "min_amount": 50000,
  "max_amount": 999999,
  "interest_rate": 2.5,
  "duration_days": 180,
  "badge": "Premium",
  "is_active": true
}
```

### Update Investment Plan
```http
PUT /admin/plans/{id}
Authorization: Bearer {token}
Content-Type: application/json

{ /* same fields as create */ }
```

### List Deposits
```http
GET /admin/deposits?status=pending
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [ /* deposit objects */ ]
}
```

### Approve Deposit
```http
POST /admin/deposits/{id}/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "admin_note": "Approved after verification"
}

Response: 200 OK
{
  "message": "Deposit approved.",
  "deposit": { /* updated deposit */ }
}
```

### List Withdrawals
```http
GET /admin/withdrawals?status=pending
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [ /* withdrawal objects */ ]
}
```

### Approve Withdrawal
```http
POST /admin/withdrawals/{id}/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "admin_note": "Processed to bank account"
}

Response: 200 OK
{
  "message": "Withdrawal approved.",
  "withdrawal": { /* updated withdrawal */ }
}
```

### List KYC Submissions
```http
GET /admin/kyc
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [ /* kyc objects */ ]
}
```

### Approve KYC
```http
POST /admin/kyc/{id}/approve
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "KYC approved.",
  "kyc": { /* updated kyc */ }
}
```

### Reject KYC
```http
POST /admin/kyc/{id}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Document unclear"
}

Response: 200 OK
{
  "message": "KYC rejected.",
  "kyc": { /* updated kyc */ }
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": {
    "email": ["Email must be unique"],
    "amount": ["Amount must be greater than 0"]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found."
}
```

### 422 Unprocessable Entity
```json
{
  "message": "Insufficient wallet balance."
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## 📝 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Successful, no content returned |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error - Internal server error |

---

## 🔑 Common Response Fields

**User Object:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user|admin",
  "wallet": { "id": 1, "balance": 5000, "bonus": 500 },
  "kyc": { "id": 1, "status": "pending|approved|rejected" }
}
```

**Investment Object:**
```json
{
  "id": 1,
  "user_id": 1,
  "plan_id": 1,
  "amount": 10000.00,
  "current_value": 11250.00,
  "total_profit": 1250.00,
  "status": "active|completed|rejected",
  "starts_at": "2024-08-01T00:00:00Z",
  "ends_at": "2024-09-30T00:00:00Z"
}
```

---

**Last Updated:** August 14, 2026
