<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'reference',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'balance_before' => 'float',
            'balance_after' => 'float',
        ];
    }

    public const TYPE_DEPOSIT = 'deposit';
    public const TYPE_WITHDRAWAL = 'withdrawal';
    public const TYPE_INVESTMENT = 'investment';
    public const TYPE_PROFIT = 'profit';
    public const TYPE_RETURN = 'return';
    public const TYPE_BONUS = 'bonus';

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
