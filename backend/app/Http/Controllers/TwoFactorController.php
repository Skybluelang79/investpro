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
        $user->two_factor_recovery_codes = $recoveryCodes;
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
        $user->two_factor_recovery_codes = null;
        $user->save();

        return response()->json(['message' => 'Two-factor authentication has been disabled.']);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if ($user->two_factor_enabled) {
            return response()->json(['message' => 'Two-factor authentication is already enabled.'], 400);
        }

        if (!$user->two_factor_secret) {
            return response()->json(['message' => 'No pending 2FA setup. Call enable first.'], 400);
        }

        $valid = $this->google2fa->verifyKey($user->two_factor_secret, $request->input('code'));

        if (!$valid) {
            return response()->json(['message' => 'Invalid code. Please try again.'], 400);
        }

        $user->two_factor_enabled = true;
        $user->save();

        return response()->json([
            'message' => 'Two-factor authentication has been enabled.',
            'recovery_codes' => $user->two_factor_recovery_codes,
        ]);
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $user = User::where('email', $request->input('email'))->first();

        if (!$user || !$user->two_factor_enabled) {
            return response()->json(['message' => 'User not found or 2FA not enabled.'], 400);
        }

        $code = $request->input('code');

        if (strlen($code) === 6) {
            $valid = $this->google2fa->verifyKey($user->two_factor_secret, $code);
        } else {
            $valid = $this->verifyRecoveryCode($user, $code);
        }

        if (!$valid) {
            return response()->json(['message' => 'Invalid two-factor authentication code.'], 400);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Two-factor authentication verified.',
            'token' => $token,
            'user' => $user->load('wallet'),
        ]);
    }

    public function regenerateRecoveryCodes(Request $request): JsonResponse
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

        $recoveryCodes = [];
        for ($i = 0; $i < 8; $i++) {
            $recoveryCodes[] = strtoupper(Str::random(4) . '-' . Str::random(4));
        }

        $user->two_factor_recovery_codes = $recoveryCodes;
        $user->save();

        return response()->json([
            'message' => 'Recovery codes regenerated.',
            'recovery_codes' => $recoveryCodes,
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
            'recovery_codes' => $user->two_factor_recovery_codes,
        ]);
    }

    private function verifyRecoveryCode(User $user, string $code): bool
    {
        $codes = $user->two_factor_recovery_codes ?? [];

        $normalized = strtoupper(trim($code));

        foreach ($codes as $index => $storedCode) {
            if (hash_equals($storedCode, $normalized)) {
                unset($codes[$index]);
                $user->two_factor_recovery_codes = array_values($codes);
                $user->save();
                return true;
            }
        }

        return false;
    }
}
