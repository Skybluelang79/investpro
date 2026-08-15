<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletService
{
    public function getOrCreate(int $userId): Wallet
    {
        return Wallet::firstOrCreate(['user_id' => $userId], ['balance' => 0, 'bonus' => 0]);
    }

    public function lockWallet(int $userId): Wallet
    {
        $wallet = Wallet::where('user_id', $userId)->lockForUpdate()->first();

        return $wallet ?? $this->getOrCreate($userId);
    }

    public function credit(int $userId, float $amount, string $type, string $description = '', ?string $reference = null): Transaction
    {
        return DB::transaction(function () use ($userId, $amount, $type, $description, $reference) {
            $wallet = $this->lockWallet($userId);
            $before = $wallet->balance;
            $wallet->increment('balance', $amount);

            return Transaction::create([
                'user_id' => $userId,
                'type' => $type,
                'amount' => $amount,
                'balance_before' => $before,
                'balance_after' => $wallet->fresh()->balance,
                'reference' => $reference ?? $this->reference('TRX'),
                'description' => $description,
                'status' => 'completed',
            ]);
        });
    }

    public function debit(int $userId, float $amount, string $type, string $description = '', ?string $reference = null): Transaction
    {
        return DB::transaction(function () use ($userId, $amount, $type, $description, $reference) {
            $wallet = $this->lockWallet($userId);

            if ($wallet->balance < $amount) {
                throw new \RuntimeException('Insufficient wallet balance.');
            }

            $before = $wallet->balance;
            $wallet->decrement('balance', $amount);

            return Transaction::create([
                'user_id' => $userId,
                'type' => $type,
                'amount' => -$amount,
                'balance_before' => $before,
                'balance_after' => $wallet->fresh()->balance,
                'reference' => $reference ?? $this->reference('TRX'),
                'description' => $description,
                'status' => 'completed',
            ]);
        });
    }

    public function creditBonus(int $userId, float $amount, string $description = '', ?string $reference = null): Transaction
    {
        return DB::transaction(function () use ($userId, $amount, $description, $reference) {
            $wallet = $this->lockWallet($userId);
            $before = $wallet->balance;
            $wallet->increment('bonus', $amount);
            $wallet->increment('balance', $amount);

            return Transaction::create([
                'user_id' => $userId,
                'type' => 'bonus',
                'amount' => $amount,
                'balance_before' => $before,
                'balance_after' => $wallet->fresh()->balance,
                'reference' => $reference ?? $this->reference('BON'),
                'description' => $description,
                'status' => 'completed',
            ]);
        });
    }

    public static function reference(string $prefix = 'TRX'): string
    {
        return strtoupper($prefix.'-'.Str::random(10));
    }
}
