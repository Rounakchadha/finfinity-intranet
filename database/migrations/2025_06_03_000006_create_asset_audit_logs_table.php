<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('asset_tag');
            $table->string('action'); // created, allocated, deallocated, reallocated, decommissioned
            $table->string('performed_by_email');
            $table->string('performed_by_name');
            $table->string('from_user_email')->nullable(); // for reallocate/deallocate
            $table->string('to_user_email')->nullable();   // for allocate/reallocate
            $table->text('notes')->nullable();
            $table->timestamp('performed_at');

            $table->index('asset_tag');
            $table->index('performed_by_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_audit_logs');
    }
};
