<?php

namespace App\Http\Controllers;

use App\Models\Investment;
use App\Services\InvestmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvestmentController extends Controller
{
    public function __construct(private InvestmentService $investmentService)
    {
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
}
