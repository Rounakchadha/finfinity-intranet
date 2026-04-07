<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_codes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category'); // wifi, cafeteria, parking, emergency, custom
            $table->text('description')->nullable();
            $table->text('content');           // URL or raw text encoded in QR
            $table->boolean('is_dynamic')->default(false); // dynamic = content can be updated
            $table->string('created_by_name');
            $table->string('created_by_email');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_codes');
    }
};
