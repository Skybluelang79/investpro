<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\WithdrawalApprovedMail;
use App\Mail\WithdrawalRejectedMail;
use App\Models\Notification;
use App\Models\Withdrawal;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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

        $withdrawal->update([
            'status' => Withdrawal::STATUS_APPROVED,
            'processed_at' => now(),
            'admin_note' => $request->input('note'),
        ]);

        Notification::create([
            'user_id' => $withdrawal->user_id,
            'title' => 'Withdrawal approved',
            'message' => 'Your withdrawal of '.number_format($withdrawal->amount, 2).' has been approved and processed.',
            'type' => 'success',
        ]);

        $user = $withdrawal->user;
        try {
            Mail::to($user->email)->send(new WithdrawalApprovedMail($user->name, $withdrawal->amount, $withdrawal->reference));
        } catch (\Throwable $e) {
            Log::warning('Failed to send withdrawal approved email: '.$e->getMessage());
        }

        return response()->json(['message' => 'Withdrawal approved.', 'withdrawal' => $withdrawal->fresh()]);
    }

    public function reject(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        if ($withdrawal->status !== Withdrawal::STATUS_PENDING) {
            return response()->json(['message' => 'Only pending withdrawals can be rejected.'], 422);
        }

        DB::transaction(function () use ($withdrawal, $request) {
            $this->walletService->credit(
                $withdrawal->user_id,
                $withdrawal->amount,
                'return',
                "Withdrawal {$withdrawal->reference} rejected - funds returned",
                $withdrawal->reference
            );

            $withdrawal->update([
                'status' => Withdrawal::STATUS_REJECTED,
                'processed_at' => now(),
                'admin_note' => $request->input('note', 'Rejected by admin'),
            ]);
        });

        Notification::create([
            'user_id' => $withdrawal->user_id,
            'title' => 'Withdrawal rejected',
            'message' => 'Your withdrawal of '.number_format($withdrawal->amount, 2).' was rejected. Funds have been returned to your wallet. '.$withdrawal->admin_note,
            'type' => 'error',
        ]);

        $user = $withdrawal->user;
        try {
            Mail::to($user->email)->send(new WithdrawalRejectedMail(
                $user->name,
                $withdrawal->amount,
                $withdrawal->reference,
                $withdrawal->admin_note ?? 'No reason provided'
            ));
        } catch (\Throwable $e) {
            Log::warning('Failed to send withdrawal rejected email: '.$e->getMessage());
        }

        return response()->json(['message' => 'Withdrawal rejected. Funds returned to wallet.', 'withdrawal' => $withdrawal->fresh()]);
    }
}
