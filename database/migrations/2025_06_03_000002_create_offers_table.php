<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates_master')->cascadeOnDelete();
            $table->foreignId('job_id')->constrained('jobs_master')->cascadeOnDelete();
            $table->string('offer_document_path');
            $table->string('subject_line');
            $table->text('email_content');
            $table->string('status', 20)->default('Sent'); // Sent, Accepted, Rejected
            $table->timestamp('sent_at')->nullable();
            $table->string('created_by_email');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
