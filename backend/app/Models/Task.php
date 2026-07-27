<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['project_id', 'assign_id', 'title', 'description', 'category', 'deadline', 'estimated_effort', 'status'])]
class Task extends Model
{
    use HasFactory;

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assign_id');
    }

    public function timeLogs()
    {
        return $this->hasMany(TimeLog::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
