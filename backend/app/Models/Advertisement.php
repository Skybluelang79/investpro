<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Advertisement extends Model
{
    protected $fillable = [
        'title',
        'description',
        'image_url',
        'link_url',
        'position',
        'ad_type',
        'width',
        'height',
        'is_active',
        'priority',
        'start_at',
        'end_at',
        'click_count',
        'impression_count',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'click_count' => 'integer',
            'impression_count' => 'integer',
            'start_at' => 'datetime',
            'end_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        $now = now();

        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', $now);
            });
    }

    public function trackClick(): void
    {
        $this->increment('click_count');
    }

    public function trackImpression(): void
    {
        $this->increment('impression_count');
    }
}
