<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'body',
        'posted_by_name',
        'posted_by_email',
        'is_pinned',
        'expires_at',
    ];

    protected $casts = [
        'is_pinned'  => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function acknowledgements()
    {
        return $this->hasMany(AnnouncementAcknowledgement::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }

    public function scopePinnedFirst(Builder $query): Builder
    {
        return $query->orderByDesc('is_pinned')->orderByDesc('created_at');
    }
}
