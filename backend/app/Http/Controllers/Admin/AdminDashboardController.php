<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Investment;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $totalBalance = (float) DB::table('wallets')->sum('balance');
        $totalInvested = (float) Investment::where('status', Investment::STATUS_ACTIVE)->sum('amount');
        $totalProfit = (float) Investment::sum('total_profit');
        $totalUsers = User::where('role', 'user')->count();
        $totalReferrals = User::whereNotNull('referred_by')->count();
        $totalBonusPaid = (float) Transaction::where('type', Transaction::TYPE_BONUS)->sum('amount');
        $pendingDeposits = Deposit::where('status', Deposit::STATUS_PENDING)->count();
        $pendingWithdrawals = Withdrawal::where('status', Withdrawal::STATUS_PENDING)->count();

        $monthlyChart = collect(range(5, 0))->map(function ($i) {
            $month = now()->subMonths($i);

            return [
                'month' => $month->format('M'),
                'deposits' => (float) Deposit::where('status', Deposit::STATUS_COMPLETED)
                    ->whereBetween('completed_at', [$month->startOfMonth(), $month->endOfMonth()])
                    ->sum('amount'),
                'withdrawals' => (float) Withdrawal::where('status', Withdrawal::STATUS_APPROVED)
                    ->whereBetween('processed_at', [$month->startOfMonth(), $month->endOfMonth()])
                    ->sum('amount'),
            ];
        });

        $recentUsers = User::where('role', 'user')->latest()->limit(5)->get(['id', 'name', 'email', 'created_at']);
        $recentDeposits = Deposit::with('user:id,name,email')->latest()->limit(5)->get();

        return response()->json([
            'total_balance' => $totalBalance,
            'total_invested' => $totalInvested,
            'total_profit' => $totalProfit,
            'total_bonus_paid' => $totalBonusPaid,
            'total_users' => $totalUsers,
            'total_referrals' => $totalReferrals,
            'pending_deposits' => $pendingDeposits,
            'pending_withdrawals' => $pendingWithdrawals,
            'chart' => $monthlyChart,
            'recent_users' => $recentUsers,
            'recent_deposits' => $recentDeposits,
        ]);
    }
}
