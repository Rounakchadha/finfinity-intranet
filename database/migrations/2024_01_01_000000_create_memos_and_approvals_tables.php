<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create the 'memos' table
        Schema::create('memos', function (Blueprint $table) {
            $table->id();
            $table->text('description');
            $table->unsignedBigInteger('raised_by')->nullable();
            $table->date('issued_on');
            $table->string('document_path');
            $table->timestamps();
        });

        // 2. Create the 'approvals' table
        Schema::create('approvals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('memo_id');
            $table->bigInteger('user_id')->nullable();
            $table->string('status')->default('pending');
            $table->text('comment')->nullable();
            $table->datetime('approved_at')->nullable();
            $table->timestamps();

            $table->foreign('memo_id')->references('id')->on('memos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approvals');
        Schema::dropIfExists('memos');
    }
};
