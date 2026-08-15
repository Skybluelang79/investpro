<?php

namespace App\Http\Controllers;

use App\Models\KycVerification;
use App\Models\Withdrawal;
use App\Models\Notification;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WithdrawalController extends Controller
{
    public function __construct(private WalletService $walletService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $withdrawals = $request->user()->withdrawals()->latest()->paginate($request->integer('per_page', 15));

        return response()->json($withdrawals);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'method' => ['required', 'string', 'max:100'],
            'account_details' => ['required', 'array'],
        ]);

        $user = $request->user();
        $kyc = $user->kyc;

        if (! $kyc || $kyc->status !== KycVerification::STATUS_APPROVED) {
            return response()->json(['message' => 'KYC verification required before withdrawing.'], 422);
        }

        $wallet = $this->walletService->getOrCreate($user->id);

        if ($wallet->balance < $validated['amount']) {
            return response()->json(['message' => 'Insufficient wallet balance.'], 422);
        }

        $withdrawal = Withdrawal::create([
            'user_id' => $user->id,
            'reference' => WalletService::reference('WDR'),
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'account_details' => $validated['account_details'],
            'status' => Withdrawal::STATUS_PENDING,
        ]);

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Withdrawal requested',
            'message' => 'Your withdrawal of '.number_format($validated['amount'], 2).' is pending approval.',
            'type' => 'info',
        ]);

        return response()->json([
            'message' => 'Withdrawal requested. Awaiting approval.',
            'withdrawal' => $withdrawal,
        ], 201);
    }

    public function show(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        if ($withdrawal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json(['withdrawal' => $withdrawal]);
    }
}
