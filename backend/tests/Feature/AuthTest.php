<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestUser;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase, CreatesTestUser;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'name', 'email', 'wallet'],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
        $this->assertDatabaseHas('wallets', [
            'user_id' => User::where('email', 'test@example.com')->value('id'),
            'balance' => 0,
        ]);
    }

    public function test_user_can_login(): void
    {
        $this->postJson('/api/v1/register', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'token', 'user']);
    }

    public function test_user_cannot_login_with_wrong_password(): void
    {
        $this->postJson('/api/v1/register', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(422);
    }

    public function test_user_can_logout(): void
    {
        $result = $this->registerAndGetToken();
        $token = $result['token'];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/logout');

        $response->assertOk()
            ->assertJson(['message' => 'Logged out.']);
    }

    public function test_unauthenticated_access_returns_401(): void
    {
        $response = $this->getJson('/api/v1/me');
        $response->assertStatus(401);
    }

    public function test_registration_with_referral_gives_bonus(): void
    {
        $referrer = $this->createUser([
            'name' => 'Referrer',
            'email' => 'referrer@example.com',
        ]);

        $ref = $referrer->referral_code;

        $response = $this->postJson('/api/v1/register', [
            'name' => 'Referred',
            'email' => 'referred@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'referral_code' => $ref,
        ]);

        $response->assertStatus(201);

        $referrer->refresh();
        $this->assertGreaterThan(0, $referrer->wallet->bonus);
    }

    public function test_registration_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_registration_requires_unique_email(): void
    {
        $this->postJson('/api/v1/register', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response = $this->postJson('/api/v1/register', [
            'name' => 'Test 2',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
