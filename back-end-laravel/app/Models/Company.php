<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;
    protected $fillable = [
        'ra_social',
        'ruc',
        'address',
        'status',
        'phone',
        'email',
    ];


    // Relación 1 a * inversa
    public function user()
    {
        return $this->belongsToMany(User::class, 'user_administration_companies');
        // return $this->belongsTo(User::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function keyProjects()
    {
        return $this->hasMany(KeyProject::class);
    }


    //Relación polimorfica 1 * 1
    public function image()
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
