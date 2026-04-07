<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnouncementAcknowledgement extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'announcement_id',
        'acknowledged_by_email',
        'acknowledged_by_name',
        'acknowledged_at',
    ];

    protected $casts = [
        'acknowledged_at' => 'datetime',
    ];

    public function announcement()
    {
        return $this->belongsTo(Announcement::class);
    }
}
