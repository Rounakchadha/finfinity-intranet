<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portal_documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('filename');           // stored name on disk
            $table->string('original_filename');  // original upload name
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->string('uploaded_by_email');
            $table->string('uploaded_by_name');
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_documents');
    }
};
