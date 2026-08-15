<?php

namespace Database\Seeders;

use App\Models\Investment;
use App\Models\InvestmentPlan;
use App\Models\User;
use App\Models\Wallet;
use App\Services\WalletService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            InvestmentPlanSeeder::class,
            AdminSeeder::class,
        ]);

        $user = User::firstOrCreate(
            ['email' => 'demo@investpro.test'],
            [
                'name' => 'Demo User',
                'password' => 'password',
                'role' => 'user',
                'referral_code' => 'DEMO2024',
            ]
        );

        $wallet = app(WalletService::class);
        $wallet->getOrCreate($user->id);
        $wallet->credit($user->id, 25000, 'deposit', 'Demo initial deposit');

        /** @var InvestmentPlan $growthPlan */
        $growthPlan = InvestmentPlan::where('name', 'Growth Plan')->first();

        if ($growthPlan) {
            $now = now();
            Investment::create([
                'user_id' => $user->id,
                'plan_id' => $growthPlan->id,
                'reference' => 'INV-DEMO-0001',
                'amount' => 10000,
                'current_value' => 11250,
                'total_profit' => 1250,
                'daily_profit' => 125,
                'status' => Investment::STATUS_ACTIVE,
                'starts_at' => $now->copy()->subDays(10),
                'ends_at' => $now->copy()->addDays(50),
                'next_payout_at' => $now->copy()->addDay(),
            ]);

            $wallet->credit($user->id, 1250, 'profit', 'Demo accrued profit');
        }
    }
}
