<?php

namespace App\Http\Middleware;

use App\Models\AdminAuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditAdminActions
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user()) {
            AdminAuditLog::create([
                'admin_user_id' => $request->user()->id,
                'action' => strtoupper($request->method()).' '.$request->path(),
                'entity_type' => $this->entityType($request),
                'entity_id' => $this->entityId($request),
                'method' => $request->method(),
                'path' => $request->path(),
                'request_data' => $this->sanitize($request->all()),
                'response_status' => $response->getStatusCode(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return $response;
    }

    private function entityType(Request $request): ?string
    {
        $type = $this->adminResourceSegment($request);

        return $type !== null ? rtrim($type, 's') : null;
    }

    private function entityId(Request $request): ?int
    {
        $segments = array_slice($request->segments(), $this->adminIndex($request) + 1);

        foreach ($segments as $segment) {
            if (is_numeric($segment)) {
                return (int) $segment;
            }
        }

        return null;
    }

    private function adminResourceSegment(Request $request): ?string
    {
        $index = $this->adminIndex($request);

        if ($index === null) {
            return null;
        }

        return $request->segments()[$index + 1] ?? null;
    }

    private function adminIndex(Request $request): ?int
    {
        $index = array_search('admin', $request->segments(), true);

        return $index === false ? null : $index;
    }

    private function sanitize(array $data): array
    {
        unset($data['password'], $data['password_confirmation'], $data['current_password'], $data['token']);

        return $data;
    }
}
