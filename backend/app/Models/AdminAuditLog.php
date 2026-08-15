<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminAuditLog extends Model
{
    protected $fillable = [
        'admin_user_id',
        'action',
        'entity_type',
        'entity_id',
        'method',
        'path',
        'request_data',
        'response_status',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'request_data' => 'array',
            'response_status' => 'integer',
            'entity_id' => 'integer',
        ];
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }
}
