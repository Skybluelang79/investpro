<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::with(['wallet', 'kyc'])
            ->where('role', 'user')
            ->when($request->has('search'), fn ($q) => $q->where(function ($q) use ($request) {
                $search = $request->get('search');
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%');
            }))
            ->when($request->has('status'), function ($q) use ($request) {
                $q->where('is_active', $request->get('status') === 'active');
            })
            ->when($request->has('kyc_status'), function ($q) use ($request) {
                $q->whereHas('kyc', fn ($q) => $q->where('status', $request->get('kyc_status')));
            })
            ->when($request->has('has_investment'), function ($q) {
                $q->whereHas('investments', fn ($q) => $q->where('status', 'active'));
            })
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(['user' => $user->load([
            'wallet',
            'kyc',
            'investments.plan',
            'deposits',
            'withdrawals',
            'referrer:id,name,email',
            'referrals:id,name,email,created_at',
        ])]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'email' => ['sometimes', 'string', 'email', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $user->update($validated);

        return response()->json(['message' => 'User updated.', 'user' => $user->fresh(['wallet', 'kyc'])]);
    }

    public function toggleActive(User $user): JsonResponse
    {
        $user->update(['is_active' => ! $user->is_active]);

        $status = $user->is_active ? 'activated' : 'deactivated';

        return response()->json(['message' => "User {$status}.", 'user' => $user->fresh()]);
    }

    public function impersonate(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot impersonate admin users.'], 422);
        }

        $adminId = request()->user()->id;

        $token = $user->createToken('impersonation', ['impersonate'])->plainTextToken;

        return response()->json([
            'message' => "Impersonating {$user->name}.",
            'token' => $token,
            'user' => $user->load('wallet'),
            'impersonator_id' => $adminId,
        ]);
    }

    public function summary(User $user): JsonResponse
    {
        $totalDeposited = (float) $user->deposits()
            ->where('status', 'completed')
            ->sum('amount');

        $totalWithdrawn = (float) $user->withdrawals()
            ->where('status', 'approved')
            ->sum('amount');

        $activeInvestments = $user->investments()
            ->where('status', 'active')
            ->count();

        $totalInvested = (float) $user->investments()
            ->sum('amount');

        $totalProfitEarned = (float) $user->transactions()
            ->where('type', 'profit')
            ->where('amount', '>', 0)
            ->sum('amount');

        $totalReferralBonus = (float) $user->transactions()
            ->where('type', 'bonus')
            ->sum('amount');

        return response()->json([
            'user_id' => $user->id,
            'wallet_balance' => (float) ($user->wallet->balance ?? 0),
            'total_deposited' => $totalDeposited,
            'total_withdrawn' => $totalWithdrawn,
            'active_investments' => $activeInvestments,
            'total_invested' => $totalInvested,
            'total_profit_earned' => $totalProfitEarned,
            'total_referral_bonus' => $totalReferralBonus,
            'referrals_count' => $user->referrals()->count(),
            'kyc_status' => $user->kyc->status ?? 'not_submitted',
            'account_age_days' => $user->created_at->diffInDays(now()),
            'last_login' => $user->tokens()->latest()->first()?->created_at,
        ]);
    }
}
