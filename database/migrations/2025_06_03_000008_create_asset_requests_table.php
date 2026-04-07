<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_requests', function (Blueprint $table) {
            $table->id();
            $table->string('employee_email');
            $table->string('employee_name');
            $table->string('asset_type');       // e.g. Laptop, Mouse, Keyboard
            $table->text('notes')->nullable();   // reason / description
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('reviewed_by_email')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index('employee_email');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_requests');
    }
};
