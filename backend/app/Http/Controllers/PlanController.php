<?php

namespace App\Http\Controllers;

use App\Models\InvestmentPlan;
use Illuminate\Http\JsonResponse;

class PlanController extends Controller
{
    public function index(): JsonResponse
    {
        $plans = InvestmentPlan::where('is_active', true)->orderBy('min_amount')->get();

        return response()->json(['plans' => $plans]);
    }

    public function show(InvestmentPlan $plan): JsonResponse
    {
        if (! $plan->is_active) {
            return response()->json(['message' => 'Plan not found.'], 404);
        }

        return response()->json(['plan' => $plan]);
    }
}
