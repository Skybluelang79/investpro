<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\DepositConfirmedMail;
use App\Models\Deposit;
use App\Models\Notification;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminDepositController extends Controller
{
    public function __construct(private WalletService $walletService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $deposits = Deposit::with('user:id,name,email')
            ->when($request->has('status'), fn ($q) => $q->where('status', $request->get('status')))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($deposits);
    }

    public function approve(Request $request, Deposit $deposit): JsonResponse
    {
        if ($deposit->status !== Deposit::STATUS_PENDING) {
            return response()->json(['message' => 'Only pending deposits can be approved.'], 422);
        }

        $this->walletService->credit(
            $deposit->user_id,
            $deposit->amount,
            'deposit',
            "Deposit {$deposit->reference} via {$deposit->method}",
            $deposit->reference
        );

        $deposit->update([
            'status' => Deposit::STATUS_COMPLETED,
            'completed_at' => now(),
            'admin_note' => $request->input('note'),
        ]);

        Notification::create([
            'user_id' => $deposit->user_id,
            'title' => 'Deposit confirmed',
            'message' => 'Your deposit of '.number_format($deposit->amount, 2).' has been confirmed and credited to your wallet.',
            'type' => 'success',
        ]);

        $user = $deposit->user;
        try {
            Mail::to($user->email)->send(new DepositConfirmedMail($user->name, $deposit->amount, $deposit->reference));
        } catch (\Throwable $e) {
            Log::warning('Failed to send deposit confirmation email: '.$e->getMessage());
        }

        return response()->json(['message' => 'Deposit approved and wallet credited.', 'deposit' => $deposit->fresh()]);
    }

    public function reject(Request $request, Deposit $deposit): JsonResponse
    {
        if ($deposit->status !== Deposit::STATUS_PENDING) {
            return response()->json(['message' => 'Only pending deposits can be rejected.'], 422);
        }

        $deposit->update([
            'status' => Deposit::STATUS_FAILED,
            'admin_note' => $request->input('note', 'Rejected by admin'),
        ]);

        Notification::create([
            'user_id' => $deposit->user_id,
            'title' => 'Deposit rejected',
            'message' => 'Your deposit of '.number_format($deposit->amount, 2).' was rejected. '.$deposit->admin_note,
            'type' => 'error',
        ]);

        return response()->json(['message' => 'Deposit rejected.', 'deposit' => $deposit->fresh()]);
    }
}
