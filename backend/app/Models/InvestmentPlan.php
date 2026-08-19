<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvestmentPlan extends Model
{
    use HasFactory;

    protected $table = 'investment_plans';

    protected $fillable = [
        'name',
        'description',
        'min_amount',
        'max_amount',
        'interest_rate',
        'duration_days',
        'badge',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'min_amount' => 'float',
            'max_amount' => 'float',
            'interest_rate' => 'float',
            'duration_days' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function investments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Investment::class, 'plan_id');
    }
}
