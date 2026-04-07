<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('links', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->string('logo_path')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('background_color')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('group_personalized_links', function (Blueprint $table) {
            $table->id();
            $table->string('microsoft_group_name');
            $table->string('link_name');
            $table->string('link_url');
            $table->integer('sort_order')->default(0);
            $table->string('replaces_link')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_personalized_links');
        Schema::dropIfExists('links');
    }
};
