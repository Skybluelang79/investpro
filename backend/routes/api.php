<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
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
        });

    });

});
