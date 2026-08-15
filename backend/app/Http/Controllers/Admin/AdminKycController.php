<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KycVerification;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminKycController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $kyc = KycVerification::with('user:id,name,email')
            ->when($request->has('status'), fn ($q) => $q->where('status', $request->get('status')))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($kyc);
    }

    public function approve(KycVerification $kyc): JsonResponse
    {
        $kyc->update(['status' => KycVerification::STATUS_APPROVED, 'verified_at' => now(), 'rejection_reason' => null]);

        Notification::create([
            'user_id' => $kyc->user_id,
            'title' => 'KYC approved',
            'message' => 'Your identity verification has been approved. You can now withdraw funds.',
            'type' => 'success',
        ]);

        return response()->json(['message' => 'KYC approved.', 'kyc' => $kyc->fresh()]);
    }

    public function reject(Request $request, KycVerification $kyc): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $kyc->update(['status' => KycVerification::STATUS_REJECTED, 'rejection_reason' => $validated['reason']]);

        Notification::create([
            'user_id' => $kyc->user_id,
            'title' => 'KYC rejected',
            'message' => 'Your identity verification was rejected: '.$validated['reason'],
            'type' => 'error',
        ]);

        return response()->json(['message' => 'KYC rejected.', 'kyc' => $kyc->fresh()]);
    }
}
