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
        Schema::create('divisions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbr');
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('division_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('status')->default('pending');
            $table->date('due_date')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('urgent_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('division')->default('');
            $table->string('priority')->default('medium');
            $table->string('due')->default('');
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->date('start_date');                     // ← renamed from 'date'
            $table->date('end_date')->nullable();           // ← NEW
            $table->string('time')->default('');
            $table->string('location')->default('');
            $table->string('type')->default('event');
            $table->timestamps();
        });

        Schema::create('payment_periods', function (Blueprint $table) {
            $table->id();
            $table->string('from_month');
            $table->string('to_month');
            $table->unsignedSmallInteger('year');
            $table->boolean('open')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('payment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_period_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('status')->default('pending');
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_items');
        Schema::dropIfExists('payment_periods');
        Schema::dropIfExists('events');
        Schema::dropIfExists('urgent_items');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('divisions');
    }
};