<?php

namespace App\Services;

use App\Mail\InvestmentMaturedMail;
use App\Models\Investment;
use App\Models\InvestmentPlan;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class InvestmentService
{
    public function __construct(private WalletService $walletService)
    {
    }

    public function create(int $userId, int $planId, float $amount): Investment
    {
        /** @var InvestmentPlan $plan */
        $plan = InvestmentPlan::findOrFail($planId);

        if (! $plan->is_active) {
            throw new \RuntimeException('This investment plan is not available.');
        }

        if ($amount < $plan->min_amount) {
            throw new \RuntimeException('Amount is below the plan minimum of '.number_format($plan->min_amount, 2).'.');
        }

        if ($plan->max_amount && $amount > $plan->max_amount) {
            throw new \RuntimeException('Amount exceeds the plan maximum of '.number_format($plan->max_amount, 2).'.');
        }

        return DB::transaction(function () use ($userId, $plan, $amount) {
            $this->walletService->debit($userId, $amount, 'investment', "Investment in {$plan->name}");

            $reference = WalletService::reference('INV');
            $dailyProfit = $amount * ($plan->interest_rate / 100);
            $now = now();

            $investment = Investment::create([
                'user_id' => $userId,
                'plan_id' => $plan->id,
                'reference' => $reference,
                'amount' => $amount,
                'current_value' => $amount,
                'total_profit' => 0,
                'daily_profit' => round($dailyProfit, 2),
                'status' => Investment::STATUS_ACTIVE,
                'starts_at' => $now,
                'ends_at' => $now->copy()->addDays($plan->duration_days),
                'next_payout_at' => $now->copy()->addDay(),
            ]);

            Notification::create([
                'user_id' => $userId,
                'title' => 'Investment started',
                'message' => "Your {$plan->name} investment of ".number_format($amount, 2).' is now active.',
                'type' => 'success',
            ]);

            return $investment->load('plan');
        });
    }

    /**
     * Accrue daily profits for active investments that are due a payout.
     */
    public function accrueDueProfits(): int
    {
        $processed = 0;

        Investment::where('status', Investment::STATUS_ACTIVE)
            ->where('next_payout_at', '<=', now())
            ->chunkById(100, function ($investments) use (&$processed) {
                foreach ($investments as $investment) {
                    $this->accrue($investment);
                    $processed++;
                }
            });

        return $processed;
    }

    public function accrue(Investment $investment): void
    {
        DB::transaction(function () use ($investment) {
            $investment->current_value += $investment->daily_profit;
            $investment->total_profit += $investment->daily_profit;
            $investment->next_payout_at = now()->addDay();

            if ($investment->ends_at && now()->gte($investment->ends_at)) {
                $investment->status = Investment::STATUS_COMPLETED;
                $investment->next_payout_at = null;

                $this->walletService->credit(
                    $investment->user_id,
                    $investment->amount,
                    'return',
                    "Return of capital on investment {$investment->reference} ({$investment->plan->name})",
                    $investment->reference
                );

                Notification::create([
                    'user_id' => $investment->user_id,
                    'title' => 'Investment completed',
                    'message' => "Investment {$investment->reference} matured. Principal ".number_format($investment->amount, 2).' credited to your wallet.',
                    'type' => 'success',
                ]);

                $user = $investment->user;
                try {
                    Mail::to($user->email)->send(new InvestmentMaturedMail(
                        $user->name,
                        $investment->reference,
                        $investment->amount,
                        $investment->total_profit
                    ));
                } catch (\Throwable $e) {
                    Log::warning('Failed to send investment matured email: '.$e->getMessage());
                }
            } else {
                $this->walletService->credit(
                    $investment->user_id,
                    $investment->daily_profit,
                    'profit',
                    "Daily profit for {$investment->reference}",
                    $investment->reference
                );
            }

            $investment->save();
        });
    }
}
