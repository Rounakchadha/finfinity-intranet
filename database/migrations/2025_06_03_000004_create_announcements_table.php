<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('posted_by_name');
            $table->string('posted_by_email');
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('announcement_acknowledgements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('announcement_id')->constrained('announcements')->cascadeOnDelete();
            $table->string('acknowledged_by_email');
            $table->string('acknowledged_by_name');
            $table->timestamp('acknowledged_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcement_acknowledgements');
        Schema::dropIfExists('announcements');
    }
};
