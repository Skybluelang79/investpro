<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

trait LogsActivity
{
    protected function logActivity(string $action, string $description, array $metadata = null, int $userId = null): ActivityLog
    {
        /** @var Request $request */
        $request = request();

        return ActivityLog::create([
            'user_id' => $userId ?? $request->user()?->id,
            'action' => $action,
            'description' => $description,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => $metadata,
        ]);
    }
}
