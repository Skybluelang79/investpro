<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->transactions()->latest();

        if ($request->has('type') && in_array($request->get('type'), ['deposit', 'withdrawal', 'investment', 'profit', 'return', 'bonus'])) {
            $query->where('type', $request->get('type'));
        }

        if ($request->filled('search')) {
            $search = '%' . $request->get('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', $search)
                    ->orWhere('reference', 'like', $search);
            });
        }

        if ($request->filled('from') || $request->filled('to')) {
            try {
                $from = $request->filled('from') ? Carbon::parse($request->get('from'))->startOfDay() : null;
                $to = $request->filled('to') ? Carbon::parse($request->get('to'))->endOfDay() : null;

                if ($from && $to) {
                    $query->whereBetween('created_at', [$from, $to]);
                } elseif ($from) {
                    $query->where('created_at', '>=', $from);
                } elseif ($to) {
                    $query->where('created_at', '<=', $to);
                }
            } catch (\\Exception $e) {
                // ignore invalid date formats and proceed without date filter
            }
        }

        $summary = (clone $query)->selectRaw('sum(amount) as total, count(*) as count')->first();
        $paginated = $query->paginate($request->integer('per_page', 15));

            return response()->json([
                'data' => $paginated->items(),
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'bonus_total' => (float) ($summary->total ?? 0),
                'bonus_count' => (int) ($summary->count ?? 0),
            ]);
    }

    public function show(Request $request, $transaction): JsonResponse
    {
        $transaction = $request->user()->transactions()->findOrFail($transaction);

        return response()->json(['transaction' => $transaction]);
    }
}
