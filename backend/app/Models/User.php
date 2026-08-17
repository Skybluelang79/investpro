<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use App\Models\Transaction;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $appends = [
        'referrals_count',
        'referral_bonus_total',
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'role',
        'is_active',
        'referral_code',
        'referred_by',
        'email_verified_at',
        'google_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function wallet(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function investments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Investment::class);
    }

    public function deposits(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    public function withdrawals(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function transactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function notifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function kyc(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(KycVerification::class);
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(self::class, 'referred_by');
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(self::class, 'referred_by');
    }

    public function getReferralsCountAttribute(): int
    {
        return $this->referrals()->count();
    }

    public function getReferralBonusTotalAttribute(): float
    {
        return (float) $this->transactions()->where('type', Transaction::TYPE_BONUS)->sum('amount');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
