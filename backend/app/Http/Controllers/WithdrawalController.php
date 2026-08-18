<?php

namespace App\Http\Controllers;

use App\Models\KycVerification;
use App\Models\Withdrawal;
use App\Models\Notification;
use App\Services\WalletService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    use LogsActivity;
    private const MIN_WITHDRAWAL = 20;
    private const MAX_WITHDRAWAL = 50000;
    private const DAILY_WITHDRAWAL_LIMIT = 100000;

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
            'amount' => ['required', 'numeric', 'min:'.self::MIN_WITHDRAWAL, 'max:'.self::MAX_WITHDRAWAL],
            'method' => ['required', 'string', 'max:100'],
            'account_details' => ['required', 'array'],
        ]);

        $user = $request->user();
        $kyc = $user->kyc;

        if (! $kyc || $kyc->status !== KycVerification::STATUS_APPROVED) {
            return response()->json(['message' => 'KYC verification required before withdrawing.'], 422);
        }

        $todayTotal = $user->withdrawals()
            ->where('status', Withdrawal::STATUS_PENDING)
            ->whereDate('created_at', today())
            ->sum('amount');

        if (($todayTotal + $validated['amount']) > self::DAILY_WITHDRAWAL_LIMIT) {
            return response()->json([
                'message' => 'Daily withdrawal limit of '.number_format(self::DAILY_WITHDRAWAL_LIMIT, 2).' reached. Try again tomorrow.',
            ], 422);
        }

        $reference = WalletService::reference('WDR');

        $withdrawal = DB::transaction(function () use ($user, $validated, $reference) {
            $this->walletService->debit(
                $user->id,
                $validated['amount'],
                'withdrawal',
                "Withdrawal request {$reference} via {$validated['method']}",
                $reference
            );

            return Withdrawal::create([
                'user_id' => $user->id,
                'reference' => $reference,
                'amount' => $validated['amount'],
                'method' => $validated['method'],
                'account_details' => $validated['account_details'],
                'status' => Withdrawal::STATUS_PENDING,
            ]);
        });

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Withdrawal requested',
            'message' => 'Your withdrawal of '.number_format($validated['amount'], 2).' has been submitted. Funds have been held from your wallet pending approval.',
            'type' => 'info',
        ]);

        $this->logActivity(
            'withdrawal_created',
            "Requested withdrawal of {$validated['amount']} via {$validated['method']}",
            ['withdrawal_id' => $withdrawal->id, 'amount' => $validated['amount'], 'method' => $validated['method']]
        );

        return response()->json([
            'message' => 'Withdrawal requested. Funds held from wallet pending approval.',
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
