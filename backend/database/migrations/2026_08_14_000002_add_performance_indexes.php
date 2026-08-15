<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
        });

        Schema::table('investments', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('deposits', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->index('type');
            $table->index('created_at');
        });

        Schema::table('kyc_verifications', function (Blueprint $table) {
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropIndex(['role']));
        Schema::table('investments', fn (Blueprint $table) => $table->dropIndex(['status']));
        Schema::table('deposits', fn (Blueprint $table) => $table->dropIndex(['status']));
        Schema::table('withdrawals', fn (Blueprint $table) => $table->dropIndex(['status']));
        Schema::table('transactions', fn (Blueprint $table) => $table->dropIndex(['type', 'created_at']));
        Schema::table('kyc_verifications', fn (Blueprint $table) => $table->dropIndex(['status']));
    }
};
