<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Investment;
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

        $transactionsByType = Transaction::whereBetween('created_at', [$from, $to])
            ->selectRaw('type, sum(amount) as total, count(*) as count')
            ->groupBy('type')
            ->get();

        return response()->json([
            'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'deposits' => $deposits,
            'withdrawals' => $withdrawals,
            'net_cashflow' => $netCashflow,
            'profit_paid' => $profitPaid,
            'returns_paid' => $returnsPaid,
            'referral_bonus_paid' => $referralBonusPaid,
            'new_users' => $newUsers,
            'new_investments' => $newInvestments,
            'new_investment_volume' => $newInvestmentVolume,
            'transactions_by_type' => $transactionsByType,
        ]);
    }
}
