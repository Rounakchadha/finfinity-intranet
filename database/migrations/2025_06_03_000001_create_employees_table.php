<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('employee_email')->unique();
            $table->string('personal_email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('job_title');
            $table->string('department');
            $table->string('manager_email')->nullable();
            $table->date('start_date');
            $table->date('last_working_day')->nullable();
            $table->string('status', 20)->default('Active'); // Active, Resigned, Terminated
            $table->text('resignation_reason')->nullable();
            $table->timestamp('resigned_at')->nullable();
            $table->string('onboarded_by_email')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
