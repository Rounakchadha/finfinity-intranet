<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $table = 'employees';

    protected $fillable = [
        'name',
        'employee_email',
        'personal_email',
        'phone',
        'job_title',
        'department',
        'manager_email',
        'start_date',
        'last_working_day',
        'status',
        'resignation_reason',
        'resigned_at',
        'onboarded_by_email',
    ];

    protected $casts = [
        'start_date' => 'date',
        'last_working_day' => 'date',
        'resigned_at' => 'datetime',
    ];

    public function isActive(): bool
    {
        return $this->status === 'Active';
    }
}
