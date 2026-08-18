<?php

namespace App\Http\Controllers;

use App\Models\Investment;
use App\Services\InvestmentService;
use App\Services\WalletService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvestmentController extends Controller
{
    use LogsActivity;

    public function __construct(
        private InvestmentService $investmentService,
        private WalletService $walletService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $investments = $request->user()->investments()
            ->with('plan')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($investments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:investment_plans,id'],
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        try {
            $investment = $this->investmentService->create(
                $request->user()->id,
                $validated['plan_id'],
                (float) $validated['amount']
            );

            $this->logActivity(
                'investment_created',
                "Created investment of {$validated['amount']} in {$investment->plan->name}",
                ['investment_id' => $investment->id, 'amount' => $validated['amount'], 'plan' => $investment->plan->name]
            );

            return response()->json([
                'message' => 'Investment created successfully.',
                'investment' => $investment,
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Request $request, Investment $investment): JsonResponse
    {
        if ($investment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json(['investment' => $investment->load(['plan', 'user'])]);
    }

    public function cancel(Request $request, Investment $investment): JsonResponse
    {
        if ($investment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if ($investment->status !== Investment::STATUS_ACTIVE) {
            return response()->json(['message' => 'Only active investments can be cancelled.'], 422);
        }

        $daysElapsed = now()->diffInDays($investment->starts_at);
        $totalDays = $investment->ends_at->diffInDays($investment->starts_at);
        $progress = $daysElapsed / max($totalDays, 1);

        if ($progress > 0.5) {
            return response()->json([
                'message' => 'Cannot cancel investment after 50% of the duration has elapsed. Please wait for it to mature.',
            ], 422);
        }

        $refundAmount = $investment->amount + $investment->total_profit;

        $investment->status = 'cancelled';
        $investment->save();

        $this->walletService->credit(
            $request->user()->id,
            $refundAmount,
            'return',
            "Cancelled investment {$investment->reference} ({$investment->plan->name}) - refund",
            $investment->reference
        );

        $this->logActivity(
            'investment_cancelled',
            "Cancelled investment {$investment->reference} with refund of " . number_format($refundAmount, 2),
            ['investment_id' => $investment->id, 'refund' => $refundAmount]
        );

        return response()->json([
            'message' => 'Investment cancelled. Refund of ' . number_format($refundAmount, 2) . ' credited to wallet.',
            'investment' => $investment->fresh()->load('plan'),
        ]);
    }
}
