<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Advertisement::active()->orderByDesc('priority');

        if ($request->filled('position')) {
            $query->where('position', $request->input('position'));
        }

        $ads = $query->get();

        $ads->each(function ($ad) {
            $ad->trackImpression();
        });

        return response()->json(['advertisements' => $ads]);
    }

    public function trackClick(Request $request, Advertisement $ad): JsonResponse
    {
        $ad->trackClick();

        return response()->json(['url' => $ad->link_url]);
    }
}
