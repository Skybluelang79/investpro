<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminWithdrawalController extends Controller
{
    public function __construct(private WalletService $walletService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $withdrawals = Withdrawal::with('user:id,name,email')
            ->when($request->has('status'), fn ($q) => $q->where('status', $request->get('status')))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($withdrawals);
    }

    public function show(Withdrawal $withdrawal): JsonResponse
    {
        return response()->json(['withdrawal' => $withdrawal->load('user')]);
    }

    public function approve(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        if ($withdrawal->status !== Withdrawal::STATUS_PENDING) {
            return response()->json(['message' => 'Only pending withdrawals can be approved.'], 422);
        }

        try {
            DB::transaction(function () use ($withdrawal, $request) {
                $wallet = Wallet::where('user_id', $withdrawal->user_id)->lockForUpdate()->first()
                    ?? $this->walletService->getOrCreate($withdrawal->user_id);

                if ($wallet->balance < $withdrawal->amount) {
                    throw new \RuntimeException('Insufficient balance to approve this withdrawal.');
                }

                $this->walletService->debit(
                    $withdrawal->user_id,
                    $withdrawal->amount,
                    'withdrawal',
                    "Withdrawal {$withdrawal->reference} via {$withdrawal->method}",
                    $withdrawal->reference
                );

                $withdrawal->update([
                    'status' => Withdrawal::STATUS_APPROVED,
                    'processed_at' => now(),
                    'admin_note' => $request->input('note'),
                ]);
            });
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        Notification::create([
            'user_id' => $withdrawal->user_id,
            'title' => 'Withdrawal approved',
            'message' => 'Your withdrawal of '.number_format($withdrawal->amount, 2).' has been approved and processed.',
            'type' => 'success',
        ]);

        return response()->json(['message' => 'Withdrawal approved.', 'withdrawal' => $withdrawal->fresh()]);
    }

    public function reject(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        if ($withdrawal->status !== Withdrawal::STATUS_PENDING) {
            return response()->json(['message' => 'Only pending withdrawals can be rejected.'], 422);
        }

        $withdrawal->update([
            'status' => Withdrawal::STATUS_REJECTED,
            'processed_at' => now(),
            'admin_note' => $request->input('note', 'Rejected by admin'),
        ]);

        Notification::create([
            'user_id' => $withdrawal->user_id,
            'title' => 'Withdrawal rejected',
            'message' => 'Your withdrawal of '.number_format($withdrawal->amount, 2).' was rejected. '.$withdrawal->admin_note,
            'type' => 'error',
        ]);

        return response()->json(['message' => 'Withdrawal rejected.', 'withdrawal' => $withdrawal->fresh()]);
    }
}
