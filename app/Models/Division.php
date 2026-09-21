<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    protected $fillable = ['name', 'abbr', 'display_order'];

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class)->orderBy('display_order');
    }
}
