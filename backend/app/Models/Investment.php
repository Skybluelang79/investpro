<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Investment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'reference',
        'amount',
        'current_value',
        'total_profit',
        'daily_profit',
        'status',
        'starts_at',
        'ends_at',
        'next_payout_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'current_value' => 'float',
            'total_profit' => 'float',
            'daily_profit' => 'float',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'next_payout_at' => 'datetime',
        ];
    }

    public const STATUS_ACTIVE = 'active';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_REJECTED = 'rejected';

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(InvestmentPlan::class);
    }
}
