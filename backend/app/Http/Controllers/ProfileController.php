<?php

namespace App\Http\Controllers;

use App\Models\Investment;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    use LogsActivity;
    public function show(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()->load(['wallet', 'kyc'])]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($request->user()->id)],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($validated);

        $this->logActivity('profile_updated', 'Profile information updated', array_keys($validated));

        return response()->json(['message' => 'Profile updated.', 'user' => $user->fresh(['wallet', 'kyc'])]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => $validated['password']]);

        $this->logActivity('password_changed', 'Account password was changed');

        return response()->json(['message' => 'Password updated.']);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $path = $request->file('avatar')->store('avatars', 'public');
        $request->user()->update(['avatar' => $path]);

        return response()->json(['message' => 'Avatar updated.', 'avatar' => $path]);
    }

    public function deactivate(Request $request): JsonResponse
    {
        $user = $request->user();

        $hasActiveInvestments = $user->investments()
            ->where('status', Investment::STATUS_ACTIVE)
            ->exists();

        if ($hasActiveInvestments) {
            return response()->json([
                'message' => 'Cannot deactivate account with active investments. Please wait for them to mature or contact support.',
            ], 422);
        }

        $hasPendingWithdrawals = $user->withdrawals()
            ->where('status', 'pending')
            ->exists();

        if ($hasPendingWithdrawals) {
            return response()->json([
                'message' => 'Cannot deactivate account with pending withdrawals. Please wait for them to be processed.',
            ], 422);
        }

        $wallet = $user->wallet;
        if ($wallet && $wallet->balance > 0) {
            return response()->json([
                'message' => 'Cannot deactivate account with remaining balance. Please withdraw your funds first.',
            ], 422);
        }

        $user->update(['is_active' => false]);
        $user->tokens()->delete();

        $this->logActivity('account_deactivated', 'Account was self-deactivated');

        return response()->json(['message' => 'Account deactivated. Contact support to reactivate.']);
    }
}
