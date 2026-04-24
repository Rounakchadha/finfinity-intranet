<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Maps Microsoft group roles to Paperless tags
        Schema::create('role_tag', function (Blueprint $table) {
            $table->id();
            $table->string('role');         // e.g. 'HR Manager', 'IT Admin'
            $table->string('tag');          // Paperless tag name or ID
            $table->timestamps();
        });

        // Maps Paperless document IDs to their tags
        Schema::create('doc_tag', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_id'); // Paperless document ID
            $table->string('tag');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doc_tag');
        Schema::dropIfExists('role_tag');
    }
};
