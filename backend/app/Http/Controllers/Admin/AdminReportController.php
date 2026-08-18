<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Investment;
use App\Models\InvestmentPlan;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $from = $request->get('from') ? now()->parse($request->get('from'))->startOfDay() : now()->startOfMonth();
        $to = $request->get('to') ? now()->parse($request->get('to'))->endOfDay() : now()->endOfDay();

        $deposits = (float) Deposit::where('status', Deposit::STATUS_COMPLETED)->whereBetween('completed_at', [$from, $to])->sum('amount');
        $withdrawals = (float) Withdrawal::where('status', Withdrawal::STATUS_APPROVED)->whereBetween('processed_at', [$from, $to])->sum('amount');
        $profitPaid = (float) Transaction::where('type', 'profit')->whereBetween('created_at', [$from, $to])->where('amount', '>', 0)->sum('amount');
        $returnsPaid = (float) Transaction::where('type', 'return')->whereBetween('created_at', [$from, $to])->where('amount', '>', 0)->sum('amount');
        $referralBonusPaid = (float) Transaction::where('type', Transaction::TYPE_BONUS)->whereBetween('created_at', [$from, $to])->where('amount', '>', 0)->sum('amount');
        $newUsers = User::where('role', 'user')->whereBetween('created_at', [$from, $to])->count();
        $newInvestments = Investment::whereBetween('created_at', [$from, $to])->count();
        $newInvestmentVolume = (float) Investment::whereBetween('created_at', [$from, $to])->sum('amount');

        $netCashflow = $deposits - $withdrawals;
        $grossProfit = $deposits - $withdrawals - $profitPaid - $returnsPaid - $referralBonusPaid;

        $transactionsByType = Transaction::whereBetween('created_at', [$from, $to])
            ->selectRaw('type, sum(amount) as total, count(*) as count')
            ->groupBy('type')
            ->get();

        $planBreakdown = InvestmentPlan::select('id', 'name', 'interest_rate', 'duration_days')
            ->withCount(['investments as count' => function ($q) use ($from, $to) {
                $q->whereBetween('created_at', [$from, $to]);
            }])
            ->withSum(['investments as volume' => function ($q) use ($from, $to) {
                $q->whereBetween('created_at', [$from, $to]);
            }], 'amount')
            ->orderByDesc('volume')
            ->get();

        $dailyDeposits = Deposit::where('status', Deposit::STATUS_COMPLETED)
            ->whereBetween('completed_at', [$from, $to])
            ->selectRaw('date(completed_at) as day, sum(amount) as total, count(*) as count')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $topDepositors = User::where('role', 'user')
            ->whereHas('deposits', fn ($q) => $q->where('status', Deposit::STATUS_COMPLETED)->whereBetween('completed_at', [$from, $to]))
            ->withSum(['deposits as total_deposited' => fn ($q) => $q->where('status', Deposit::STATUS_COMPLETED)->whereBetween('completed_at', [$from, $to])], 'amount')
            ->orderByDesc('total_deposited')
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json([
            'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'deposits' => $deposits,
            'withdrawals' => $withdrawals,
            'net_cashflow' => $netCashflow,
            'gross_profit' => $grossProfit,
            'profit_paid' => $profitPaid,
            'returns_paid' => $returnsPaid,
            'referral_bonus_paid' => $referralBonusPaid,
            'new_users' => $newUsers,
            'new_investments' => $newInvestments,
            'new_investment_volume' => $newInvestmentVolume,
            'transactions_by_type' => $transactionsByType,
            'plan_breakdown' => $planBreakdown,
            'daily_deposits' => $dailyDeposits,
            'top_depositors' => $topDepositors,
        ]);
    }
}
