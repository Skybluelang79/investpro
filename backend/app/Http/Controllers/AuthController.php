<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\Notification;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Traits\LogsActivity;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use LogsActivity;

    private const REFERRAL_BONUS = 10;
    private const NEW_USER_REFERRAL_BONUS = 5;

    public function __construct(private WalletService $walletService)
    {
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:30'],
            'referral_code' => ['nullable', 'string', 'exists:users,referral_code'],
        ]);

        $referrerId = isset($validated['referral_code'])
            ? \App\Models\User::where('referral_code', $validated['referral_code'])->value('id')
            : null;

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone' => $validated['phone'] ?? null,
            'referral_code' => strtoupper(substr(md5(uniqid((string) mt_rand(), true)), 0, 8)),
            'referred_by' => $referrerId,
        ]);

        $this->walletService->getOrCreate($user->id);

        if ($referrerId) {
            $this->walletService->creditBonus(
                $referrerId,
                self::REFERRAL_BONUS,
                'Referral reward for inviting '.$user->name,
                WalletService::reference('REF')
            );

            Notification::create([
                'user_id' => $referrerId,
                'title' => 'Referral bonus earned',
                'message' => 'You earned a referral bonus of '.number_format(self::REFERRAL_BONUS, 2).' for inviting '.$user->name.'.',
                'type' => 'success',
            ]);

            $this->walletService->creditBonus(
                $user->id,
                self::NEW_USER_REFERRAL_BONUS,
                'Referral signup bonus',
                WalletService::reference('REF')
            );

            Notification::create([
                'user_id' => $user->id,
                'title' => 'Welcome bonus credited',
                'message' => 'You received a referral signup bonus of '.number_format(self::NEW_USER_REFERRAL_BONUS, 2).'.',
                'type' => 'success',
            ]);
        }

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Welcome to InvestPro',
            'message' => 'Your account has been created. Complete your KYC to unlock withdrawals.',
            'type' => 'info',
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully.',
            'token' => $token,
            'user' => $user->load('wallet'),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = \App\Models\User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Your account has been deactivated. Contact support.'], 403);
        }

        $token = $user->createToken('auth')->plainTextToken;

        $this->logActivity('login', 'User logged in', null, $user->id);

        return response()->json([
            'message' => 'Logged in successfully.',
            'token' => $token,
            'user' => $user->load('wallet'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->logActivity('logout', 'User logged out');

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['wallet', 'kyc']);

        return response()->json(['user' => $user]);
    }
}
