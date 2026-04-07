<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_type_master', function (Blueprint $table) {
            $table->id();
            $table->string('type')->unique();
            $table->string('keyword')->nullable();
            $table->timestamps();
        });

        Schema::create('location_master', function (Blueprint $table) {
            $table->id();
            $table->string('unique_location')->unique();
            $table->integer('total_assets')->default(0);
            $table->timestamps();
        });

        Schema::create('asset_master', function (Blueprint $table) {
            $table->id();
            $table->string('tag')->unique();
            $table->string('type')->nullable(); // references asset_type_master(type)
            $table->string('ownership')->nullable();
            $table->string('warranty')->nullable();
            $table->date('warranty_start')->nullable();
            $table->date('warranty_end')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('model')->nullable();
            $table->string('location')->nullable(); // references location_master(unique_location)
            $table->string('status')->default('active');
            $table->timestamps();
            
            $table->foreign('type')->references('type')->on('asset_type_master')->nullOnDelete();
            $table->foreign('location')->references('unique_location')->on('location_master')->nullOnDelete();
        });

        Schema::create('allocated_asset_master', function (Blueprint $table) {
            $table->id();
            $table->string('asset_tag'); // references asset_master(tag)
            $table->string('user_email')->nullable();
            $table->datetime('assign_on')->nullable();
            $table->string('status')->default('active');
            $table->datetime('end_date')->nullable();
            $table->timestamps();
            
            $table->foreign('asset_tag')->references('tag')->on('asset_master')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('allocated_asset_master');
        Schema::dropIfExists('asset_master');
        Schema::dropIfExists('location_master');
        Schema::dropIfExists('asset_type_master');
    }
};
