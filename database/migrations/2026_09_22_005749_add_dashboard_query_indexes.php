<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('divisions', function (Blueprint $table): void {
            $table->index('display_order');
        });
        Schema::table('tasks', function (Blueprint $table): void {
            $table->index(['division_id', 'display_order']);
        });
        Schema::table('urgent_items', function (Blueprint $table): void {
            $table->index('display_order');
        });
        Schema::table('events', function (Blueprint $table): void {
            $table->index('start_date');   // ← was 'date'
            $table->index('end_date');     // ← new
        });
        Schema::table('payment_periods', function (Blueprint $table): void {
            $table->index('display_order');
        });
        Schema::table('payment_items', function (Blueprint $table): void {
            $table->index(['payment_period_id', 'display_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('divisions', function (Blueprint $table): void {
            $table->dropIndex(['display_order']);
        });
        Schema::table('tasks', function (Blueprint $table): void {
            $table->dropIndex(['division_id', 'display_order']);
        });
        Schema::table('urgent_items', function (Blueprint $table): void {
            $table->dropIndex(['display_order']);
        });
        Schema::table('events', function (Blueprint $table): void {
            $table->dropIndex(['start_date']);   // ← was ['date']
            $table->dropIndex(['end_date']);     // ← new
        });
        Schema::table('payment_periods', function (Blueprint $table): void {
            $table->dropIndex(['display_order']);
        });
        Schema::table('payment_items', function (Blueprint $table): void {
            $table->dropIndex(['payment_period_id', 'display_order']);
        });
    }
};