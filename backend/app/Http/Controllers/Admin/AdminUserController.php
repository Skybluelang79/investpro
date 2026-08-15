<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::with(['wallet', 'kyc'])
            ->where('role', 'user')
            ->when($request->has('search'), fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->get('search').'%')
                    ->orWhere('email', 'like', '%'.$request->get('search').'%');
            }))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(['user' => $user->load(['wallet', 'kyc', 'investments.plan', 'deposits', 'withdrawals'])]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'email' => ['sometimes', 'string', 'email', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $user->update($validated);

        return response()->json(['message' => 'User updated.', 'user' => $user->fresh(['wallet', 'kyc'])]);
    }

    public function toggleActive(User $user): JsonResponse
    {
        $user->update(['is_active' => ! $user->is_active]);

        return response()->json(['message' => 'User status updated.', 'user' => $user->fresh()]);
    }
}
