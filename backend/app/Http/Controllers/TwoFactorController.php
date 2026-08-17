<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use PragmaRx\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    protected Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    public function enable(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->two_factor_enabled) {
            return response()->json(['message' => 'Two-factor authentication is already enabled.'], 400);
        }

        $secret = $this->google2fa->generateSecretKey();
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name', 'InvestPro'),
            $user->email,
            $secret
        );

        $recoveryCodes = [];
        for ($i = 0; $i < 8; $i++) {
            $recoveryCodes[] = strtoupper(Str::random(4) . '-' . Str::random(4));
        }

        $user->two_factor_secret = $secret;
        $user->save();

        return response()->json([
            'message' => 'Two-factor authentication secret generated. Please verify and confirm.',
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$user->two_factor_enabled) {
            return response()->json(['message' => 'Two-factor authentication is not enabled.'], 400);
        }

        $valid = $this->google2fa->verifyKey($user->two_factor_secret, $request->input('code'));

        if (!$valid) {
            return response()->json(['message' => 'Invalid two-factor authentication code.'], 400);
        }

        $user->two_factor_secret = null;
        $user->two_factor_enabled = false;
        $user->save();

        return response()->json(['message' => 'Two-factor authentication has been disabled.']);
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->input('email'))->first();

        if (!$user || !$user->two_factor_enabled) {
            return response()->json(['message' => 'User not found or 2FA not enabled.'], 400);
        }

        $valid = $this->google2fa->verifyKey($user->two_factor_secret, $request->input('code'));

        if (!$valid) {
            return response()->json(['message' => 'Invalid two-factor authentication code.'], 400);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Two-factor authentication verified.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function getSecret(Request $request): JsonResponse
    {
        $user = $request->user();

        $secret = $user->two_factor_secret ?? $this->google2fa->generateSecretKey();

        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name', 'InvestPro'),
            $user->email,
            $secret
        );

        return response()->json([
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'enabled' => $user->two_factor_enabled,
        ]);
    }
}
