<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Investment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInvestmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $investments = Investment::with(['user:id,name,email', 'plan'])
            ->when($request->has('status'), fn ($q) => $q->where('status', $request->get('status')))
            ->when($request->has('search'), fn ($q) => $q->whereHas('user', fn ($u) => $u->where('name', 'like', '%'.$request->get('search').'%')->orWhere('email', 'like', '%'.$request->get('search').'%')))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($investments);
    }

    public function show(Investment $investment): JsonResponse
    {
        return response()->json(['investment' => $investment->load(['user', 'plan'])]);
    }
}
