<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    protected $table = 'offers';

    protected $fillable = [
        'candidate_id',
        'job_id',
        'offer_document_path',
        'subject_line',
        'email_content',
        'status',
        'sent_at',
        'created_by_email',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function candidate()
    {
        return $this->belongsTo(CandidateMaster::class, 'candidate_id');
    }

    public function job()
    {
        return $this->belongsTo(JobMaster::class, 'job_id');
    }
}
