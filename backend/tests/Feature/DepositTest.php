<?php

namespace Tests\Feature;

use App\Models\Deposit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestUser;
use Tests\TestCase;

class DepositTest extends TestCase
{
    use RefreshDatabase, CreatesTestUser;

    public function test_user_can_submit_deposit(): void
    {
        $result = $this->registerAndGetToken();
        $token = $result['token'];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/deposits', [
                'amount' => 1000,
                'method' => 'bank_transfer',
                'account_details' => ['bank' => 'GTBank', 'account_number' => '1234567890'],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'deposit' => ['id', 'amount', 'method', 'status'],
            ])
            ->assertJson(['deposit' => ['status' => 'pending']]);

        $this->assertDatabaseHas('deposits', [
            'user_id' => $result['user']->id,
            'amount' => 1000,
            'status' => Deposit::STATUS_PENDING,
        ]);
    }

    public function test_user_can_list_deposits(): void
    {
        $result = $this->registerAndGetToken();
        $token = $result['token'];

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/deposits', [
                'amount' => 500,
                'method' => 'bank_transfer',
            ]);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/deposits', [
                'amount' => 750,
                'method' => 'crypto',
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/deposits');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_user_can_view_single_deposit(): void
    {
        $result = $this->registerAndGetToken();
        $token = $result['token'];

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/deposits', [
                'amount' => 500,
                'method' => 'bank_transfer',
            ]);

        $deposit = Deposit::where('user_id', $result['user']->id)->first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/v1/deposits/{$deposit->id}");

        $response->assertOk()
            ->assertJson(['deposit' => ['amount' => 500.0]]);
    }

    public function test_deposit_requires_amount_and_method(): void
    {
        $result = $this->registerAndGetToken();
        $token = $result['token'];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/deposits', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount', 'method']);
    }

    public function test_unauthenticated_cannot_submit_deposit(): void
    {
        $response = $this->postJson('/api/v1/deposits', [
            'amount' => 1000,
            'method' => 'bank_transfer',
        ]);

        $response->assertStatus(401);
    }
}
