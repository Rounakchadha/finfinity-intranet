<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_master', function (Blueprint $table) {
            $table->string('monthly_rent')->nullable()->after('location');
            $table->date('out_date')->nullable()->after('monthly_rent');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->string('employee_number', 20)->nullable()->after('id');
            $table->string('device_type', 30)->nullable()->after('status');
            // department was non-nullable — relax it so Excel-imported employees can omit it
            $table->string('department')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('asset_master', function (Blueprint $table) {
            $table->dropColumn(['monthly_rent', 'out_date']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['employee_number', 'device_type']);
            $table->string('department')->nullable(false)->change();
        });
    }
};
