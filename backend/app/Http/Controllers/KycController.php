<?php

namespace App\Http\Controllers;

use App\Models\KycVerification;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KycController extends Controller
{
    use LogsActivity;

    public function show(Request $request): JsonResponse
    {
        $kyc = $request->user()->kyc;

        return response()->json(['kyc' => $kyc]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'document_type' => ['required', 'string', 'in:passport,id_card,drivers_license'],
            'document_number' => ['nullable', 'string', 'max:100'],
            'document_front' => ['nullable', 'image', 'max:4096'],
            'document_back' => ['nullable', 'image', 'max:4096'],
        ]);

        $user = $request->user();

        if ($user->kyc && $user->kyc->status === KycVerification::STATUS_APPROVED) {
            return response()->json(['message' => 'KYC already approved.'], 422);
        }

        $data = [
            'user_id' => $user->id,
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'] ?? null,
            'status' => KycVerification::STATUS_PENDING,
        ];

        if ($request->hasFile('document_front')) {
            $data['document_front'] = $request->file('document_front')->store('kyc/'.$user->id, 'public');
        }

        if ($request->hasFile('document_back')) {
            $data['document_back'] = $request->file('document_back')->store('kyc/'.$user->id, 'public');
        }

        $kyc = KycVerification::updateOrCreate(['user_id' => $user->id], $data);

        $this->logActivity(
            'kyc_submitted',
            "KYC submitted with document type: {$validated['document_type']}",
            ['kyc_id' => $kyc->id, 'document_type' => $validated['document_type']]
        );

        return response()->json([
            'message' => 'KYC submitted for review.',
            'kyc' => $kyc,
        ], 201);
    }
}
