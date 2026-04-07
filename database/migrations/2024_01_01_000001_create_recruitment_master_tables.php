<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs_master', function (Blueprint $table) {
            $table->id();
            $table->string('job_title');
            $table->string('department')->nullable();
            $table->string('location')->nullable();
            $table->string('hiring_manager')->nullable();
            $table->text('job_description')->nullable();
            $table->text('experience_requirements')->nullable();
            $table->text('education_requirements')->nullable();
            $table->integer('number_of_openings')->default(1);
            $table->decimal('salary_min', 12, 2)->nullable();
            $table->decimal('salary_max', 12, 2)->nullable();
            $table->string('status')->default('Open');
            $table->timestamps();
        });

        Schema::create('candidate_source_master', function (Blueprint $table) {
            $table->id();
            $table->string('source_name');
            $table->timestamps();
        });

        Schema::create('candidates_master', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->foreignId('source_id')->nullable()->constrained('candidate_source_master')->nullOnDelete();
            $table->string('resume_path')->nullable();
            $table->text('notes')->nullable();
            $table->string('current_status')->default('New');
            $table->timestamps();
        });

        Schema::create('candidate_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates_master')->cascadeOnDelete();
            $table->foreignId('job_id')->constrained('jobs_master')->cascadeOnDelete();
            $table->string('assignment_status')->default('Assigned');
            $table->timestamps();
        });

        Schema::create('candidate_skill_master', function (Blueprint $table) {
            $table->id();
            $table->string('skill_name');
            $table->timestamps();
        });

        Schema::create('candidate_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates_master')->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained('candidate_skill_master')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_skills');
        Schema::dropIfExists('candidate_skill_master');
        Schema::dropIfExists('candidate_jobs');
        Schema::dropIfExists('candidates_master');
        Schema::dropIfExists('candidate_source_master');
        Schema::dropIfExists('jobs_master');
    }
};
