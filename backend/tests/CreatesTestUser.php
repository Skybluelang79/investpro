<?php

namespace Tests;

use App\Models\User;
use App\Models\Wallet;

trait CreatesTestUser
{
    protected function createUser(array $overrides = []): User
    {
        $user = User::create(array_merge([
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password123',
            'referral_code' => strtoupper(substr(md5(uniqid((string) mt_rand(), true)), 0, 8)),
            'is_active' => true,
            'role' => 'user',
        ], $overrides));

        Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
            'bonus' => 0,
        ]);

        return $user;
    }

    protected function createAdmin(array $overrides = []): User
    {
        return $this->createUser(array_merge([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ], $overrides));
    }

    protected function authenticateAs(User $user): string
    {
        return $user->createToken('auth')->plainTextToken;
    }

    protected function registerAndGetToken(array $overrides = []): array
    {
        $email = $overrides['email'] ?? fake()->unique()->safeEmail();

        $response = $this->postJson('/api/v1/register', [
            'name' => $overrides['name'] ?? 'Test User',
            'email' => $email,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        return [
            'token' => $response->json('token'),
            'user' => User::where('email', $email)->first(),
        ];
    }
}
