<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates_master')->cascadeOnDelete();
            $table->foreignId('job_id')->constrained('jobs_master')->cascadeOnDelete();
            $table->string('employee_email')->unique();
            $table->date('start_date');
            $table->string('manager_email');
            $table->string('status', 20)->default('Initiated'); // Initiated, InProgress, Completed
            $table->string('created_by_email');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding');
    }
};
