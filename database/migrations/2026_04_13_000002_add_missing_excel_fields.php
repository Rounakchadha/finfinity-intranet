<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_master', function (Blueprint $table) {
            // "Location2" from laptop sheet — the employee's city (distinct from office location)
            $table->string('city')->nullable()->after('location');
            // "CONTRACT END" from laptop sheet — free-text note or date string
            $table->string('contract_end_note')->nullable()->after('out_date');
        });

        Schema::table('employees', function (Blueprint $table) {
            // Brand/model name for Finfinity Owned devices (Lenovo, HP, Warner…)
            $table->string('personal_device')->nullable()->after('device_type');
        });
    }

    public function down(): void
    {
        Schema::table('asset_master', function (Blueprint $table) {
            $table->dropColumn(['city', 'contract_end_note']);
        });
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('personal_device');
        });
    }
};
