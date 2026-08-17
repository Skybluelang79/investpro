<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        $announcements = Announcement::with('creator')->latest()->get();

        return response()->json(['announcements' => $announcements]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        $validated['created_by'] = $request->user()->id;

        $announcement = Announcement::create($validated);

        return response()->json(['message' => 'Announcement created.', 'announcement' => $announcement], 201);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'message' => ['sometimes', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        $announcement->update($validated);

        return response()->json(['message' => 'Announcement updated.', 'announcement' => $announcement]);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }

    public function toggleActive(Announcement $announcement): JsonResponse
    {
        $announcement->update(['is_active' => ! $announcement->is_active]);

        return response()->json(['message' => 'Announcement status updated.', 'announcement' => $announcement->fresh()]);
    }
}
