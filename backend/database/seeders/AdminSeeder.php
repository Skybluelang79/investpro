<?php

namespace Database\Seeders;

use App\Models\InvestmentPlan;
use App\Models\User;
use App\Models\Wallet;
use App\Services\WalletService;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@investpro.test')],
            [
                'name' => 'InvestPro Admin',
                'password' => env('ADMIN_PASSWORD', 'password'),
                'role' => 'admin',
                'is_active' => true,
                'referral_code' => 'ADMINPRO',
            ]
        );

        app(WalletService::class)->getOrCreate($admin->id);
    }
}
