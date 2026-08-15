<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvestmentPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPlanController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['plans' => InvestmentPlan::withCount('investments')->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'min_amount' => ['required', 'numeric', 'min:0'],
            'max_amount' => ['nullable', 'numeric', 'gt:min_amount'],
            'interest_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'badge' => ['nullable', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $plan = InvestmentPlan::create($validated);

        return response()->json(['message' => 'Plan created.', 'plan' => $plan], 201);
    }

    public function update(Request $request, InvestmentPlan $plan): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'min_amount' => ['sometimes', 'numeric', 'min:0'],
            'max_amount' => ['nullable', 'numeric', 'gt:min_amount'],
            'interest_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'duration_days' => ['sometimes', 'integer', 'min:1'],
            'badge' => ['nullable', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $plan->update($validated);

        return response()->json(['message' => 'Plan updated.', 'plan' => $plan]);
    }

    public function destroy(InvestmentPlan $plan): JsonResponse
    {
        if ($plan->investments()->exists()) {
            $plan->update(['is_active' => false]);

            return response()->json(['message' => 'Plan has active investments. It was deactivated instead.']);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan deleted.']);
    }

    public function toggleActive(InvestmentPlan $plan): JsonResponse
    {
        $plan->update(['is_active' => ! $plan->is_active]);

        return response()->json(['message' => 'Plan status updated.', 'plan' => $plan->fresh()]);
    }
}
