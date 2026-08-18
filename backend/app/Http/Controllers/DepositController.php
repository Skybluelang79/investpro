<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\Notification;
use App\Services\WalletService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepositController extends Controller
{
    use LogsActivity;

    public function __construct(private WalletService $walletService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $deposits = $request->user()->deposits()->latest()->paginate($request->integer('per_page', 15));

        return response()->json($deposits);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'method' => ['required', 'string', 'max:100'],
            'account_details' => ['nullable', 'array'],
        ]);

        $deposit = Deposit::create([
            'user_id' => $request->user()->id,
            'reference' => WalletService::reference('DEP'),
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'account_details' => $validated['account_details'] ?? null,
            'status' => Deposit::STATUS_PENDING,
        ]);

        Notification::create([
            'user_id' => $request->user()->id,
            'title' => 'Deposit submitted',
            'message' => 'Your deposit of '.number_format($validated['amount'], 2).' via '.$validated['method'].' is pending review.',
            'type' => 'info',
        ]);

        $this->logActivity(
            'deposit_created',
            "Submitted deposit of {$validated['amount']} via {$validated['method']}",
            ['deposit_id' => $deposit->id, 'amount' => $validated['amount'], 'method' => $validated['method']]
        );

        return response()->json([
            'message' => 'Deposit submitted. Awaiting confirmation.',
            'deposit' => $deposit,
        ], 201);
    }

    public function show(Request $request, Deposit $deposit): JsonResponse
    {
        if ($deposit->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json(['deposit' => $deposit]);
    }
}
