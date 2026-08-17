<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::where('user_id', $request->user()->id)
            ->orderByDesc('created_at');

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        $logs = $query->paginate($request->integer('per_page', 20));

        return response()->json($logs);
    }

    public function stats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $base = ActivityLog::where('user_id', $userId);

        $totalActions = (clone $base)->count();

        $loginCount = (clone $base)->where('action', 'login')->count();

        $lastLogin = (clone $base)
            ->where('action', 'login')
            ->latest('created_at')
            ->value('created_at');

        $actionBreakdown = (clone $base)
            ->selectRaw('action, count(*) as count')
            ->groupBy('action')
            ->pluck('count', 'action');

        $recentActivity = (clone $base)
            ->latest('created_at')
            ->limit(5)
            ->get(['action', 'description', 'created_at']);

        return response()->json([
            'total_actions' => $totalActions,
            'login_count' => $loginCount,
            'last_login' => $lastLogin,
            'action_breakdown' => $actionBreakdown,
            'recent_activity' => $recentActivity,
        ]);
    }
}
