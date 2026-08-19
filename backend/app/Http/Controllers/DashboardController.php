<?php

namespace App\Http\Controllers;

use App\Models\Investment;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('wallet');

        $invested = (float) $user->investments()->where('status', Investment::STATUS_ACTIVE)->sum('amount');
        $totalInvested = (float) $user->investments()->sum('amount');
        $totalProfit = (float) $user->investments()->sum('total_profit');
        $pendingWithdrawals = (float) $user->withdrawals()->where('status', 'pending')->sum('amount');
        $completedInvestments = (float) $user->investments()->where('status', Investment::STATUS_COMPLETED)->sum('current_value');

        $transactions = $user->transactions()->latest()->limit(10)->get();

        $thisMonth = $user->transactions()
            ->where('created_at', '>=', now()->startOfMonth())
            ->where('amount', '>', 0)
            ->sum('amount');

        $lastMonth = $user->transactions()
            ->whereBetween('created_at', [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()])
            ->where('amount', '>', 0)
            ->sum('amount');

        $monthlyGrowth = $lastMonth > 0 ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 2) : 100;

        $activeInvestments = $user->investments()
            ->with('plan')
            ->where('status', Investment::STATUS_ACTIVE)
            ->latest()
            ->limit(5)
            ->get();

        $sixMonthsAgo = now()->subMonths(5)->startOfMonth();

        $investmentData = $user->investments()
            ->where('created_at', '>=', $sixMonthsAgo)
            ->get()
            ->groupBy(fn ($inv) => $inv->created_at->format('Y-m'))
            ->map(fn ($group) => (float) $group->sum('current_value'));

        $chart = collect(range(5, 0))->map(function ($i) use ($investmentData) {
            $month = now()->subMonths($i);
            $key = $month->format('Y-m');

            return [
                'month' => $month->format('M'),
                'value' => $investmentData[$key] ?? 0,
            ];
        });

        $referralData = $user->referrals()
            ->where('created_at', '>=', $sixMonthsAgo)
            ->get()
            ->groupBy(fn ($r) => $r->created_at->format('Y-m'))
            ->map(fn ($group) => $group->count());

        $bonusData = $user->transactions()
            ->where('type', Transaction::TYPE_BONUS)
            ->where('created_at', '>=', $sixMonthsAgo)
            ->get()
            ->groupBy(fn ($t) => $t->created_at->format('Y-m'))
            ->map(fn ($group) => (float) $group->sum('amount'));

        $referralChart = collect(range(5, 0))->map(function ($i) use ($referralData, $bonusData) {
            $month = now()->subMonths($i);
            $key = $month->format('Y-m');

            return [
                'month' => $month->format('M'),
                'referrals' => $referralData[$key] ?? 0,
                'bonus' => $bonusData[$key] ?? 0,
            ];
        });

        return response()->json([
            'wallet' => $user->wallet,
            'bonus_balance' => (float) ($user->wallet?->bonus ?? 0),
            'referral_bonus_earned' => (float) $user->transactions()->where('type', Transaction::TYPE_BONUS)->sum('amount'),
            'referrals_count' => $user->referrals()->count(),
            'referral_code' => $user->referral_code,
            'referral_chart' => $referralChart,
            'total_balance' => (float) ($user->wallet?->balance ?? 0),
            'total_invested' => $totalInvested,
            'active_invested' => $invested,
            'total_profit' => $totalProfit,
            'pending_withdrawals' => $pendingWithdrawals,
            'completed_returns' => $completedInvestments,
            'monthly_growth' => $monthlyGrowth,
            'monthly_income' => $thisMonth,
            'recent_transactions' => $transactions,
            'active_investments' => $activeInvestments,
            'chart' => $chart,
        ]);
    }
}
