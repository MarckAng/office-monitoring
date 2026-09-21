<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentPeriod extends Model
{
    protected $fillable = ['from_month', 'to_month', 'year', 'open', 'display_order'];
    
    public function items(): HasMany
    {
        return $this->hasMany(PaymentItem::class, 'payment_period_id')->orderBy('display_order');
    }
    
    public function getStatusAttribute(): string
    {
        if ($this->items->isEmpty()) return 'empty';
        if ($this->items->every(fn($i) => $i->status === 'paid')) return 'paid';
        if ($this->items->every(fn($i) => $i->status === 'pending')) return 'pending';
        if ($this->items->contains('status', 'process')) return 'process';
        return 'partial';
    }
}