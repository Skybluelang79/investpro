<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    ActivityLogController,
    AnnouncementController,
    EmailVerificationController,
    PasswordResetController,
    PlanController,
    InvestmentController,
    WalletController,
    DepositController,
    WithdrawalController,
    TransactionController,
    NotificationController,
    KycController,
    ProfileController,
    DashboardController,
    PaymentController,
    SocialAuthController,
    TwoFactorController,
};

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {

    Route::get('plans', [PlanController::class, 'index']);
    Route::get('plans/{plan}', [PlanController::class, 'show']);

    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:auth');

    // Announcements (public)
    Route::get('announcements', [AnnouncementController::class, 'index']);

    // Advertisements (public)
    Route::get('advertisements', [\App\Http\Controllers\AdvertisementController::class, 'index']);
    Route::post('advertisements/{ad}/click', [\App\Http\Controllers\AdvertisementController::class, 'trackClick']);

    // Google OAuth
    Route::get('auth/google/redirect', [SocialAuthController::class, 'redirect']);
    Route::get('auth/google/callback', [SocialAuthController::class, 'callback']);

    // Email Verification
    Route::post('email/verification/send', [EmailVerificationController::class, 'sendVerification'])->middleware('throttle:5,1');
    Route::post('email/verification/verify', [EmailVerificationController::class, 'verifyEmail']);
    Route::post('email/verification/resend', [EmailVerificationController::class, 'resendVerification'])->middleware('throttle:5,1');

    // Two-Factor Authentication (public - used during login flow)
    Route::post('2fa/verify', [TwoFactorController::class, 'verify']);

    // Password Reset
    Route::post('forgot-password', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:5,1');
    Route::post('verify-reset-code', [PasswordResetController::class, 'verifyResetCode']);
    Route::post('reset-password', [PasswordResetController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);

        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index']);

        // Profile
        Route::get('profile', [ProfileController::class, 'show']);
        Route::put('profile', [ProfileController::class, 'update']);
        Route::put('profile/password', [ProfileController::class, 'updatePassword']);
        Route::post('profile/avatar', [ProfileController::class, 'uploadAvatar']);

        // Two-Factor Authentication
        Route::post('2fa/enable', [TwoFactorController::class, 'enable']);
        Route::post('2fa/disable', [TwoFactorController::class, 'disable']);
        Route::get('2fa/secret', [TwoFactorController::class, 'getSecret']);

        // Investments
        Route::get('investments', [InvestmentController::class, 'index']);
        Route::post('investments', [InvestmentController::class, 'store']);
        Route::get('investments/{investment}', [InvestmentController::class, 'show']);

        // Wallet
        Route::get('wallet', [WalletController::class, 'show']);

        // Deposits
        Route::get('deposits', [DepositController::class, 'index']);
        Route::post('deposits', [DepositController::class, 'store']);
        Route::get('deposits/{deposit}', [DepositController::class, 'show']);

        // Withdrawals
        Route::get('withdrawals', [WithdrawalController::class, 'index']);
        Route::post('withdrawals', [WithdrawalController::class, 'store']);
        Route::get('withdrawals/{withdrawal}', [WithdrawalController::class, 'show']);

        // Transactions
        Route::get('transactions', [TransactionController::class, 'index']);
        Route::get('transactions/{transaction}', [TransactionController::class, 'show']);

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);

        // KYC
        Route::get('kyc', [KycController::class, 'show']);
        Route::post('kyc', [KycController::class, 'store']);

        // Payments
        Route::post('payments/create', [PaymentController::class, 'createPayment']);
        Route::post('payments/verify', [PaymentController::class, 'verifyPayment']);

        // Activity Log
        Route::get('activity/stats', [ActivityLogController::class, 'stats']);
        Route::get('activity', [ActivityLogController::class, 'index']);

        // Admin
        Route::prefix('admin')->middleware(['admin', 'audit.admin'])->group(function () {
            Route::get('dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index']);
            Route::get('reports', [\App\Http\Controllers\Admin\AdminReportController::class, 'index']);

            Route::get('users', [\App\Http\Controllers\Admin\AdminUserController::class, 'index']);
            Route::get('users/{user}', [\App\Http\Controllers\Admin\AdminUserController::class, 'show']);
            Route::put('users/{user}', [\App\Http\Controllers\Admin\AdminUserController::class, 'update']);
            Route::post('users/{user}/toggle-active', [\App\Http\Controllers\Admin\AdminUserController::class, 'toggleActive']);

            Route::get('plans', [\App\Http\Controllers\Admin\AdminPlanController::class, 'index']);
            Route::post('plans', [\App\Http\Controllers\Admin\AdminPlanController::class, 'store']);
            Route::put('plans/{plan}', [\App\Http\Controllers\Admin\AdminPlanController::class, 'update']);
            Route::delete('plans/{plan}', [\App\Http\Controllers\Admin\AdminPlanController::class, 'destroy']);
            Route::post('plans/{plan}/toggle-active', [\App\Http\Controllers\Admin\AdminPlanController::class, 'toggleActive']);

            Route::get('investments', [\App\Http\Controllers\Admin\AdminInvestmentController::class, 'index']);
            Route::get('investments/{investment}', [\App\Http\Controllers\Admin\AdminInvestmentController::class, 'show']);

            Route::get('deposits', [\App\Http\Controllers\Admin\AdminDepositController::class, 'index']);
            Route::post('deposits/{deposit}/approve', [\App\Http\Controllers\Admin\AdminDepositController::class, 'approve']);
            Route::post('deposits/{deposit}/reject', [\App\Http\Controllers\Admin\AdminDepositController::class, 'reject']);

            Route::get('withdrawals', [\App\Http\Controllers\Admin\AdminWithdrawalController::class, 'index']);
            Route::get('withdrawals/{withdrawal}', [\App\Http\Controllers\Admin\AdminWithdrawalController::class, 'show']);
            Route::post('withdrawals/{withdrawal}/approve', [\App\Http\Controllers\Admin\AdminWithdrawalController::class, 'approve']);
            Route::post('withdrawals/{withdrawal}/reject', [\App\Http\Controllers\Admin\AdminWithdrawalController::class, 'reject']);

            Route::get('kyc', [\App\Http\Controllers\Admin\AdminKycController::class, 'index']);
            Route::post('kyc/{kyc}/approve', [\App\Http\Controllers\Admin\AdminKycController::class, 'approve']);
            Route::post('kyc/{kyc}/reject', [\App\Http\Controllers\Admin\AdminKycController::class, 'reject']);

            // Exports
            Route::get('export/users', [\App\Http\Controllers\Admin\ExportController::class, 'exportUsers']);
            Route::get('export/transactions', [\App\Http\Controllers\Admin\ExportController::class, 'exportTransactions']);
            Route::get('export/investments', [\App\Http\Controllers\Admin\ExportController::class, 'exportInvestments']);
            Route::get('export/deposits', [\App\Http\Controllers\Admin\ExportController::class, 'exportDeposits']);

            // Announcements
            Route::get('announcements', [\App\Http\Controllers\Admin\AdminAnnouncementController::class, 'index']);
            Route::post('announcements', [\App\Http\Controllers\Admin\AdminAnnouncementController::class, 'store']);
            Route::put('announcements/{announcement}', [\App\Http\Controllers\Admin\AdminAnnouncementController::class, 'update']);
            Route::delete('announcements/{announcement}', [\App\Http\Controllers\Admin\AdminAnnouncementController::class, 'destroy']);
            Route::post('announcements/{announcement}/toggle-active', [\App\Http\Controllers\Admin\AdminAnnouncementController::class, 'toggleActive']);

            // Advertisements
            Route::get('advertisements', [\App\Http\Controllers\Admin\AdminAdvertisementController::class, 'index']);
            Route::post('advertisements', [\App\Http\Controllers\Admin\AdminAdvertisementController::class, 'store']);
            Route::put('advertisements/{advertisement}', [\App\Http\Controllers\Admin\AdminAdvertisementController::class, 'update']);
            Route::delete('advertisements/{advertisement}', [\App\Http\Controllers\Admin\AdminAdvertisementController::class, 'destroy']);
            Route::post('advertisements/{advertisement}/toggle-active', [\App\Http\Controllers\Admin\AdminAdvertisementController::class, 'toggleActive']);
            Route::get('advertisements/{advertisement}/stats', [\App\Http\Controllers\Admin\AdminAdvertisementController::class, 'stats']);
        });

    });

    // Webhook (public - no auth)
    Route::post('payments/webhook', [PaymentController::class, 'webhook']);

});
