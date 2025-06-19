<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scan extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'key_project_id',
        'zap_scan_id',
        'status',
        'started_at',
        'finished_at',
        'results',
    ];

    protected $casts = [
        'results' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function keyProject()
    {
        return $this->belongsTo(KeyProject::class);
    }

    public function vulnerabilities()
    {
        return $this->hasMany(Vulnerability::class);
    }
}
