<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Investment;
use App\Models\InvestmentPlan;
use App\Models\KycVerification;
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
        $pendingKyc = KycVerification::where('status', KycVerification::STATUS_PENDING)->count();

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
                'revenue' => (float) Transaction::where('type', 'profit')
                    ->whereBetween('created_at', [$month->startOfMonth(), $month->endOfMonth()])
                    ->where('amount', '>', 0)
                    ->sum('amount'),
            ];
        });

        $userGrowth = collect(range(5, 0))->map(function ($i) {
            $month = now()->subMonths($i);

            return [
                'month' => $month->format('M'),
                'new_users' => User::where('role', 'user')
                    ->whereBetween('created_at', [$month->startOfMonth(), $month->endOfMonth()])
                    ->count(),
                'new_investments' => Investment::whereBetween('created_at', [$month->startOfMonth(), $month->endOfMonth()])
                    ->count(),
                'new_investment_volume' => (float) Investment::whereBetween('created_at', [$month->startOfMonth(), $month->endOfMonth()])
                    ->sum('amount'),
            ];
        });

        $planPerformance = InvestmentPlan::withCount(['investments as active_count' => function ($q) {
            $q->where('status', Investment::STATUS_ACTIVE);
        }])->withCount('investments')
            ->withSum('investments', 'amount')
            ->orderByDesc('investments_sum_amount')
            ->get()
            ->map(fn ($plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'interest_rate' => $plan->interest_rate,
                'duration_days' => $plan->duration_days,
                'is_active' => $plan->is_active,
                'total_investments' => $plan->investments_count,
                'active_investments' => $plan->active_count,
                'total_volume' => (float) ($plan->investments_sum_amount ?? 0),
            ]);

        $recentUsers = User::where('role', 'user')->latest()->limit(5)->get(['id', 'name', 'email', 'created_at']);
        $recentDeposits = Deposit::with('user:id,name,email')->latest()->limit(5)->get();
        $recentInvestments = Investment::with(['user:id,name', 'plan:id,name'])->latest()->limit(5)->get();

        $systemHealth = [
            'total_transactions' => Transaction::count(),
            'total_completed_deposits' => Deposit::where('status', Deposit::STATUS_COMPLETED)->count(),
            'total_completed_withdrawals' => Withdrawal::where('status', Withdrawal::STATUS_APPROVED)->count(),
            'kyc_verified_users' => User::whereHas('kyc', fn ($q) => $q->where('status', KycVerification::STATUS_APPROVED))->count(),
            'active_investments' => Investment::where('status', Investment::STATUS_ACTIVE)->count(),
            'completed_investments' => Investment::where('status', Investment::STATUS_COMPLETED)->count(),
        ];

        return response()->json([
            'total_balance' => $totalBalance,
            'total_invested' => $totalInvested,
            'total_profit' => $totalProfit,
            'total_bonus_paid' => $totalBonusPaid,
            'total_users' => $totalUsers,
            'total_referrals' => $totalReferrals,
            'pending_deposits' => $pendingDeposits,
            'pending_withdrawals' => $pendingWithdrawals,
            'pending_kyc' => $pendingKyc,
            'chart' => $monthlyChart,
            'user_growth' => $userGrowth,
            'plan_performance' => $planPerformance,
            'recent_users' => $recentUsers,
            'recent_deposits' => $recentDeposits,
            'recent_investments' => $recentInvestments,
            'system_health' => $systemHealth,
        ]);
    }
}
