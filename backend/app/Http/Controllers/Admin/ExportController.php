<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Investment;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function exportUsers(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="users_export.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['ID', 'Name', 'Email', 'Phone', 'Role', 'Active', 'Referral Code', 'Referred By', 'Email Verified At', 'Created At']);

            User::query()
                ->with('referrer:id,name')
                ->orderBy('id')
                ->chunkById(500, function ($users) use ($handle) {
                    foreach ($users as $user) {
                        fputcsv($handle, [
                            $user->id,
                            $user->name,
                            $user->email,
                            $user->phone ?? '',
                            $user->role,
                            $user->is_active ? 'Yes' : 'No',
                            $user->referral_code ?? '',
                            $user->referrer->name ?? '',
                            $user->email_verified_at?->toDateTimeString() ?? '',
                            $user->created_at->toDateTimeString(),
                        ]);
                    }
                });

            fclose($handle);
        }, 200, $headers);
    }

    public function exportTransactions(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date', 'after_or_equal:from_date'],
        ]);

        $query = Transaction::query()->with('user:id,name,email')->orderBy('id');

        if (!empty($validated['from_date'])) {
            $query->where('created_at', '>=', $validated['from_date']);
        }
        if (!empty($validated['to_date'])) {
            $query->where('created_at', '<=', $validated['to_date'] . ' 23:59:59');
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transactions_export.csv"',
        ];

        return response()->stream(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['ID', 'User ID', 'User Name', 'User Email', 'Type', 'Amount', 'Balance Before', 'Balance After', 'Reference', 'Description', 'Status', 'Created At']);

            $query->chunkById(500, function ($transactions) use ($handle) {
                foreach ($transactions as $tx) {
                    fputcsv($handle, [
                        $tx->id,
                        $tx->user_id,
                        $tx->user->name ?? '',
                        $tx->user->email ?? '',
                        $tx->type,
                        $tx->amount,
                        $tx->balance_before,
                        $tx->balance_after,
                        $tx->reference,
                        $tx->description,
                        $tx->status,
                        $tx->created_at->toDateTimeString(),
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    public function exportInvestments(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="investments_export.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['ID', 'User ID', 'User Name', 'Plan', 'Reference', 'Amount', 'Current Value', 'Total Profit', 'Daily Profit', 'Status', 'Starts At', 'Ends At', 'Created At']);

            Investment::query()
                ->with(['user:id,name', 'plan:id,name'])
                ->orderBy('id')
                ->chunkById(500, function ($investments) use ($handle) {
                    foreach ($investments as $inv) {
                        fputcsv($handle, [
                            $inv->id,
                            $inv->user_id,
                            $inv->user->name ?? '',
                            $inv->plan->name ?? '',
                            $inv->reference,
                            $inv->amount,
                            $inv->current_value,
                            $inv->total_profit,
                            $inv->daily_profit,
                            $inv->status,
                            $inv->starts_at?->toDateTimeString() ?? '',
                            $inv->ends_at?->toDateTimeString() ?? '',
                            $inv->created_at->toDateTimeString(),
                        ]);
                    }
                });

            fclose($handle);
        }, 200, $headers);
    }

    public function exportDeposits(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="deposits_export.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['ID', 'User ID', 'User Name', 'Reference', 'Amount', 'Method', 'Status', 'Admin Note', 'Completed At', 'Created At']);

            Deposit::query()
                ->with('user:id,name')
                ->orderBy('id')
                ->chunkById(500, function ($deposits) use ($handle) {
                    foreach ($deposits as $deposit) {
                        fputcsv($handle, [
                            $deposit->id,
                            $deposit->user_id,
                            $deposit->user->name ?? '',
                            $deposit->reference,
                            $deposit->amount,
                            $deposit->method,
                            $deposit->status,
                            $deposit->admin_note ?? '',
                            $deposit->completed_at?->toDateTimeString() ?? '',
                            $deposit->created_at->toDateTimeString(),
                        ]);
                    }
                });

            fclose($handle);
        }, 200, $headers);
    }
}
