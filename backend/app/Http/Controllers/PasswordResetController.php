<?php

namespace App\Http\Controllers;

use App\Mail\PasswordResetMail;
use App\Models\PasswordReset;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'If the email exists, a reset code has been sent.'], 200);
        }

        PasswordReset::where('email', $request->email)->delete();

        PasswordReset::create([
            'email' => $request->email,
            'token' => Str::random(60),
            'code' => str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT),
        ]);

        $record = PasswordReset::where('email', $request->email)->latest()->first();
        Mail::to($request->email)->send(new PasswordResetMail($request->email, $record->code));

        return response()->json(['message' => 'If the email exists, a reset code has been sent.']);
    }

    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $record = PasswordReset::where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid or expired reset code.'], 422);
        }

        return response()->json(['message' => 'Code verified.', 'token' => $record->token]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = PasswordReset::where('email', $request->email)
            ->where('token', $request->token)
            ->where('code', $request->code)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = $request->password;
        $user->save();

        $record->delete();

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
