<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reference', 32)->unique();
            $table->decimal('amount', 15, 2);
            $table->string('method');
            $table->text('account_details')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('admin_note')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
    }
};
