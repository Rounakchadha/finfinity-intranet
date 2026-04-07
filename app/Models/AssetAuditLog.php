<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetAuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'asset_tag',
        'action',
        'performed_by_email',
        'performed_by_name',
        'from_user_email',
        'to_user_email',
        'notes',
        'performed_at',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
    ];
}
