<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

// NOTE: Install laravel/socialite before using this controller:
// composer require laravel/socialite
// Add to config/services.php:
//   'google' => [
//       'client_id' => env('GOOGLE_CLIENT_ID'),
//       'client_secret' => env('GOOGLE_CLIENT_SECRET'),
//       'redirect' => env('GOOGLE_REDIRECT_URI'),
//   ],

class SocialAuthController extends Controller
{
    public function __construct(private WalletService $walletService)
    {
    }

    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): JsonResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::where('google_id', $googleUser->getId())->first();

            if (! $user) {
                $existingEmail = User::where('email', $googleUser->getEmail())->first();

                if ($existingEmail) {
                    $existingEmail->update(['google_id' => $googleUser->getId()]);
                    $user = $existingEmail;
                } else {
                    $user = User::create([
                        'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'User',
                        'email' => $googleUser->getEmail(),
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                        'email_verified_at' => now(),
                        'referral_code' => strtoupper(substr(md5(uniqid((string) mt_rand(), true)), 0, 8)),
                    ]);

                    $this->walletService->getOrCreate($user->id);
                }
            }

            $token = $user->createToken('auth')->plainTextToken;

            return response()->json([
                'message' => 'Authenticated via Google.',
                'token' => $token,
                'user' => $user->load('wallet'),
            ]);
        } catch (\Exception $e) {
            Log::error('Google OAuth error: '.$e->getMessage());

            return response()->json(['message' => 'Google authentication failed.'], 401);
        }
    }
}
