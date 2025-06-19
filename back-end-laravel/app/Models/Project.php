<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
     use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'description',
        'target_url',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function scans()
    {
        return $this->hasMany(Scan::class);
    }

    public function keyProjects()
    {
        return $this->hasMany(KeyProject::class);
    }
}
