<?php

namespace Tests\Feature;

use App\Models\InvestmentPlan;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestUser;
use Tests\TestCase;

class InvestmentTest extends TestCase
{
    use RefreshDatabase, CreatesTestUser;

    protected function createActivePlan(array $overrides = []): InvestmentPlan
    {
        return InvestmentPlan::create(array_merge([
            'name' => 'Gold Plan',
            'description' => 'High-yield investment',
            'min_amount' => 100,
            'max_amount' => 5000,
            'interest_rate' => 2.5,
            'duration_days' => 30,
            'is_active' => true,
        ], $overrides));
    }

    public function test_user_can_list_plans(): void
    {
        $this->createActivePlan(['name' => 'Plan A']);
        $this->createActivePlan(['name' => 'Plan B', 'min_amount' => 500]);

        $response = $this->getJson('/api/v1/plans');

        $response->assertOk()
            ->assertJsonCount(2, 'plans');
    }

    public function test_user_can_view_plan(): void
    {
        $plan = $this->createActivePlan();

        $response = $this->getJson("/api/v1/plans/{$plan->id}");

        $response->assertOk()
            ->assertJson(['plan' => ['name' => 'Gold Plan']]);
    }

    public function test_user_can_create_investment(): void
    {
        $plan = $this->createActivePlan([
            'min_amount' => 50,
            'max_amount' => 10000,
        ]);

        $user = $this->createUser();
        $userToken = $this->authenticateAs($user);

        Wallet::where('user_id', $user->id)->update(['balance' => 5000]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $userToken)
            ->postJson('/api/v1/investments', [
                'plan_id' => $plan->id,
                'amount' => 500,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'investment' => ['id', 'amount', 'status'],
            ]);

        $this->assertDatabaseHas('investments', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'amount' => 500,
            'status' => 'active',
        ]);

        $wallet = Wallet::where('user_id', $user->id)->first();
        $this->assertEquals(4500, $wallet->balance);
    }

    public function test_cannot_invest_below_minimum(): void
    {
        $plan = $this->createActivePlan(['min_amount' => 500]);

        $user = $this->createUser();
        $userToken = $this->authenticateAs($user);

        Wallet::where('user_id', $user->id)->update(['balance' => 5000]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $userToken)
            ->postJson('/api/v1/investments', [
                'plan_id' => $plan->id,
                'amount' => 100,
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Amount is below the plan minimum of 500.00.']);
    }

    public function test_cannot_invest_above_maximum(): void
    {
        $plan = $this->createActivePlan(['max_amount' => 1000]);

        $user = $this->createUser();
        $userToken = $this->authenticateAs($user);

        Wallet::where('user_id', $user->id)->update(['balance' => 50000]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $userToken)
            ->postJson('/api/v1/investments', [
                'plan_id' => $plan->id,
                'amount' => 5000,
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Amount exceeds the plan maximum of 1,000.00.']);
    }

    public function test_cannot_invest_with_insufficient_balance(): void
    {
        $plan = $this->createActivePlan();

        $user = $this->createUser();
        $userToken = $this->authenticateAs($user);

        Wallet::where('user_id', $user->id)->update(['balance' => 10]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $userToken)
            ->postJson('/api/v1/investments', [
                'plan_id' => $plan->id,
                'amount' => 500,
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Insufficient wallet balance.']);
    }

    public function test_cannot_invest_in_inactive_plan(): void
    {
        $plan = $this->createActivePlan(['is_active' => false]);

        $user = $this->createUser();
        $userToken = $this->authenticateAs($user);

        Wallet::where('user_id', $user->id)->update(['balance' => 5000]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $userToken)
            ->postJson('/api/v1/investments', [
                'plan_id' => $plan->id,
                'amount' => 500,
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'This investment plan is not available.']);
    }

    public function test_user_can_list_investments(): void
    {
        $user = $this->createUser();
        $userToken = $this->authenticateAs($user);
        $plan = $this->createActivePlan();

        Wallet::where('user_id', $user->id)->update(['balance' => 5000]);

        $this->withHeader('Authorization', 'Bearer ' . $userToken)
            ->postJson('/api/v1/investments', [
                'plan_id' => $plan->id,
                'amount' => 500,
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $userToken)
            ->getJson('/api/v1/investments');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
