<?php

namespace Tests\Feature;

use App\Models\KycVerification;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestUser;
use Tests\TestCase;

class WithdrawalTest extends TestCase
{
    use RefreshDatabase, CreatesTestUser;

    public function test_user_can_request_withdrawal_with_kyc(): void
    {
        $result = $this->registerAndGetToken();
        $token = $result['token'];
        $user = $result['user'];

        KycVerification::create([
            'user_id' => $user->id,
            'document_type' => 'passport',
            'status' => KycVerification::STATUS_APPROVED,
        ]);

        Wallet::where('user_id', $user->id)->update(['balance' => 5000]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/withdrawals', [
                'amount' => 500,
                'method' => 'bank_transfer',
                'account_details' => ['bank' => 'GTBank', 'account_number' => '1234567890'],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'withdrawal' => ['id', 'amount', 'status'],
            ])
            ->assertJson(['withdrawal' => ['status' => 'pending']]);

        $this->assertDatabaseHas('withdrawals', [
            'user_id' => $user->id,
            'amount' => 500,
            'status' => Withdrawal::STATUS_PENDING,
        ]);
    }

    public function test_user_cannot_withdraw_without_kyc(): void
    {
        $result = $this->registerAndGetToken();
        $token = $result['token'];
        $user = $result['user'];

        Wallet::where('user_id', $user->id)->update(['balance' => 5000]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/withdrawals', [
                'amount' => 500,
                'method' => 'bank_transfer',
                'account_details' => ['bank' => 'GTBank', 'account_number' => '1234567890'],
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'KYC verification required before withdrawing.']);
    }

    public function test_user_cannot_withdraw_more_than_balance(): void
    {
        $result = $this->registerAndGetToken();
        $token = $result['token'];
        $user = $result['user'];

        KycVerification::create([
            'user_id' => $user->id,
            'document_type' => 'passport',
            'status' => KycVerification::STATUS_APPROVED,
        ]);

        Wallet::where('user_id', $user->id)->update(['balance' => 100]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/withdrawals', [
                'amount' => 500,
                'method' => 'bank_transfer',
                'account_details' => ['bank' => 'GTBank', 'account_number' => '1234567890'],
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Insufficient wallet balance.']);
    }

    public function test_user_can_list_withdrawals(): void
    {
        $result = $this->registerAndGetToken();
        $token = $result['token'];
        $user = $result['user'];

        KycVerification::create([
            'user_id' => $user->id,
            'document_type' => 'passport',
            'status' => KycVerification::STATUS_APPROVED,
        ]);

        Wallet::where('user_id', $user->id)->update(['balance' => 10000]);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/withdrawals', [
                'amount' => 500,
                'method' => 'bank_transfer',
                'account_details' => ['bank' => 'GTBank', 'account_number' => '1234567890'],
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/withdrawals');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_withdrawal_requires_fields(): void
    {
        $result = $this->registerAndGetToken();
        $token = $result['token'];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/withdrawals', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount', 'method', 'account_details']);
    }
}
