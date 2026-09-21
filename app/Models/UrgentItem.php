<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UrgentItem extends Model
{
    protected $fillable = [
        'title',
        'division',
        'priority',
        'due',
        'display_order',
    ];
}
