<?php

namespace App\Console\Commands;

use App\Services\InvestmentService;
use Illuminate\Console\Command;

class AccrueProfits extends Command
{
    protected $signature = 'investpro:accrue-profits';

    protected $description = 'Accrue daily investment profits and credit matured investments';

    public function handle(InvestmentService $investmentService): int
    {
        $count = $investmentService->accrueDueProfits();

        $this->info("Processed {$count} investment payout(s).");

        return self::SUCCESS;
    }
}
