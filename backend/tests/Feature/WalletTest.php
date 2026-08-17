<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wallet;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreatesTestUser;
use Tests\TestCase;

class WalletTest extends TestCase
{
    use RefreshDatabase, CreatesTestUser;

    public function test_user_can_view_wallet(): void
    {
        $result = $this->registerAndGetToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $result['token'])
            ->getJson('/api/v1/wallet');

        $response->assertOk()
            ->assertJsonStructure([
                'wallet' => ['id', 'user_id', 'balance', 'bonus'],
            ]);
    }

    public function test_wallet_starts_with_zero_balance(): void
    {
        $result = $this->registerAndGetToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $result['token'])
            ->getJson('/api/v1/wallet');

        $response->assertOk();
        $this->assertEquals(0, $response->json('wallet.balance'));
        $this->assertEquals(0, $response->json('wallet.bonus'));
    }

    public function test_wallet_is_created_on_registration(): void
    {
        $result = $this->registerAndGetToken();

        $this->assertDatabaseHas('wallets', [
            'user_id' => $result['user']->id,
            'balance' => 0,
            'bonus' => 0,
        ]);
    }

    public function test_admin_approve_deposit_credits_wallet(): void
    {
        $admin = $this->createAdmin();
        $user = $this->createUser(['email' => 'user@example.com']);

        Sanctum::actingAs($user);
        $this->postJson('/api/v1/deposits', [
            'amount' => 1000,
            'method' => 'bank_transfer',
        ]);

        $deposit = \App\Models\Deposit::where('user_id', $user->id)->first();

        Sanctum::actingAs($admin);
        $response = $this->postJson("/api/v1/admin/deposits/{$deposit->id}/approve", [
            'note' => 'Approved',
        ]);

        $response->assertOk();

        $wallet = Wallet::where('user_id', $user->id)->first();
        $this->assertEquals(1000, $wallet->balance);
    }

    public function test_unauthenticated_cannot_view_wallet(): void
    {
        $response = $this->getJson('/api/v1/wallet');
        $response->assertStatus(401);
    }
}
