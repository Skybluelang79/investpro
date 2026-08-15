<?php

namespace Database\Seeders;

use App\Models\InvestmentPlan;
use Illuminate\Database\Seeder;

class InvestmentPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter Plan',
                'description' => 'Perfect for new investors. Steady daily returns.',
                'min_amount' => 100,
                'max_amount' => 999,
                'interest_rate' => 0.50,
                'duration_days' => 30,
                'badge' => 'Beginner',
            ],
            [
                'name' => 'Growth Plan',
                'description' => 'Balanced growth with solid compounding potential.',
                'min_amount' => 1000,
                'max_amount' => 9999,
                'interest_rate' => 1.25,
                'duration_days' => 60,
                'badge' => 'Popular',
            ],
            [
                'name' => 'Pro Plan',
                'description' => 'Higher returns for seasoned investors.',
                'min_amount' => 10000,
                'max_amount' => 49999,
                'interest_rate' => 2.00,
                'duration_days' => 90,
                'badge' => 'Pro',
            ],
            [
                'name' => 'Elite Plan',
                'description' => 'Maximum returns for institutional investors.',
                'min_amount' => 50000,
                'max_amount' => null,
                'interest_rate' => 3.00,
                'duration_days' => 120,
                'badge' => 'Elite',
            ],
        ];

        foreach ($plans as $plan) {
            InvestmentPlan::updateOrCreate(['name' => $plan['name']], $plan);
        }
    }
}
