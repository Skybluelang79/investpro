<?php

namespace App\Http\Controllers;

use App\Mail\EmailVerificationMail;
use App\Models\EmailVerification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class EmailVerificationController extends Controller
{
    public function sendVerification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'exists:users,email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email is already verified.'], 422);
        }

        $this->createAndSend($validated['email']);

        return response()->json(['message' => 'Verification code sent to your email.']);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'exists:users,email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $verification = EmailVerification::where('email', $validated['email'])
            ->where('code', $validated['code'])
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $verification) {
            return response()->json(['message' => 'Invalid or expired verification code.'], 422);
        }

        User::where('email', $validated['email'])->update([
            'email_verified_at' => now(),
        ]);

        EmailVerification::where('email', $validated['email'])->delete();

        return response()->json(['message' => 'Email verified successfully.']);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'exists:users,email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email is already verified.'], 422);
        }

        EmailVerification::where('email', $validated['email'])->delete();

        $this->createAndSend($validated['email']);

        return response()->json(['message' => 'Verification code resent to your email.']);
    }

    private function createAndSend(string $email): void
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        EmailVerification::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => now()->addMinutes(15),
        ]);

        Mail::to($email)->send(new EmailVerificationMail($code));
    }
}
