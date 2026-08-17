<?php

namespace Tests\Feature;

use App\Models\Deposit;
use App\Models\InvestmentPlan;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\CreatesTestUser;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase, CreatesTestUser;

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = $this->createAdmin();
        $token = $this->authenticateAs($admin);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/dashboard');

        $response->assertOk();
    }

    public function test_non_admin_gets_403(): void
    {
        $user = $this->createUser();
        $token = $this->authenticateAs($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Forbidden. Admin access required.']);
    }

    public function test_admin_can_list_users(): void
    {
        $admin = $this->createAdmin();
        $token = $this->authenticateAs($admin);

        $this->createUser(['email' => 'user1@example.com']);
        $this->createUser(['email' => 'user2@example.com']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/users');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_approve_deposit(): void
    {
        $admin = $this->createAdmin();
        $user = $this->createUser(['email' => 'depositor@example.com']);

        Sanctum::actingAs($user);
        $this->postJson('/api/v1/deposits', [
            'amount' => 500,
            'method' => 'bank_transfer',
        ]);

        $deposit = Deposit::where('user_id', $user->id)->first();

        Sanctum::actingAs($admin);
        $response = $this->postJson("/api/v1/admin/deposits/{$deposit->id}/approve");

        $response->assertOk();
        $this->assertDatabaseHas('deposits', [
            'id' => $deposit->id,
            'status' => Deposit::STATUS_COMPLETED,
        ]);
    }

    public function test_admin_can_manage_plans(): void
    {
        $admin = $this->createAdmin();
        $token = $this->authenticateAs($admin);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/plans', [
                'name' => 'Admin Plan',
                'min_amount' => 100,
                'max_amount' => 10000,
                'interest_rate' => 3.0,
                'duration_days' => 15,
            ]);

        $response->assertStatus(201)
            ->assertJson(['message' => 'Plan created.']);

        $plan = InvestmentPlan::where('name', 'Admin Plan')->first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/v1/admin/plans/{$plan->id}", [
                'name' => 'Admin Plan Updated',
            ]);

        $response->assertOk()
            ->assertJson(['message' => 'Plan updated.']);
    }

    public function test_admin_can_toggle_plan_active(): void
    {
        $admin = $this->createAdmin();
        $token = $this->authenticateAs($admin);

        $plan = InvestmentPlan::create([
            'name' => 'Toggle Plan',
            'min_amount' => 100,
            'max_amount' => 5000,
            'interest_rate' => 2.0,
            'duration_days' => 10,
            'is_active' => true,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/admin/plans/{$plan->id}/toggle-active");

        $response->assertOk();
        $this->assertDatabaseHas('investment_plans', [
            'id' => $plan->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_view_reports(): void
    {
        $admin = $this->createAdmin();
        $token = $this->authenticateAs($admin);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/reports');

        $response->assertOk();
    }
}
