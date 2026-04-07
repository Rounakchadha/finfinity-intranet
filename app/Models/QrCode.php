<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QrCode extends Model
{
    protected $table = 'qr_codes';

    protected $fillable = [
        'name',
        'category',
        'description',
        'content',
        'is_dynamic',
        'created_by_name',
        'created_by_email',
    ];

    protected $casts = [
        'is_dynamic' => 'boolean',
    ];
}
