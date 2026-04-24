<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add office_location to employees
        Schema::table('employees', function (Blueprint $table) {
            $table->string('office_location')->nullable()->after('department');
        });

        // Persistent personal calendar events (locally added, not from Outlook)
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->string('user_email');
            $table->string('title');
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->boolean('all_day')->default(false);
            $table->string('location')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('office_location');
        });
        Schema::dropIfExists('calendar_events');
    }
};
