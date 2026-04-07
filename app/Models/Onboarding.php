<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Onboarding extends Model
{
    protected $table = 'onboarding';

    protected $fillable = [
        'candidate_id',
        'job_id',
        'employee_email',
        'start_date',
        'manager_email',
        'status',
        'created_by_email',
    ];

    protected $casts = [
        'start_date' => 'date',
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
