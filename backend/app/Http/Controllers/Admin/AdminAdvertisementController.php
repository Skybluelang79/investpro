<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAdvertisementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $advertisements = Advertisement::with('creator')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($advertisements);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'position' => ['required', 'string', 'in:hero,sidebar,inline,footer,popup'],
            'ad_type' => ['required', 'string', 'in:banner,card,text,video'],
            'width' => ['nullable', 'integer', 'min:0'],
            'height' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'priority' => ['sometimes', 'integer', 'min:0'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
        ]);

        $validated['created_by'] = $request->user()->id;

        $advertisement = Advertisement::create($validated);

        return response()->json(['message' => 'Advertisement created.', 'advertisement' => $advertisement], 201);
    }

    public function update(Request $request, Advertisement $advertisement): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'position' => ['sometimes', 'string', 'in:hero,sidebar,inline,footer,popup'],
            'ad_type' => ['sometimes', 'string', 'in:banner,card,text,video'],
            'width' => ['nullable', 'integer', 'min:0'],
            'height' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'priority' => ['sometimes', 'integer', 'min:0'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
        ]);

        $advertisement->update($validated);

        return response()->json(['message' => 'Advertisement updated.', 'advertisement' => $advertisement->fresh()]);
    }

    public function destroy(Advertisement $advertisement): JsonResponse
    {
        $advertisement->delete();

        return response()->json(['message' => 'Advertisement deleted.']);
    }

    public function toggleActive(Advertisement $advertisement): JsonResponse
    {
        $advertisement->update(['is_active' => ! $advertisement->is_active]);

        return response()->json(['message' => 'Advertisement status updated.', 'advertisement' => $advertisement->fresh()]);
    }

    public function stats(Advertisement $advertisement): JsonResponse
    {
        $impressions = $advertisement->impression_count;
        $clicks = $advertisement->click_count;
        $ctr = $impressions > 0 ? round(($clicks / $impressions) * 100, 2) : 0;

        return response()->json([
            'click_count' => $clicks,
            'impression_count' => $impressions,
            'ctr' => $ctr,
        ]);
    }
}
