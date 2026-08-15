<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()->latest()->paginate($request->integer('per_page', 15));

        return response()->json($notifications);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()->notifications()->where('is_read', false)->count();

        return response()->json(['unread_count' => $count]);
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $notification->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['notification' => $notification]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->notifications()->where('is_read', false)->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
