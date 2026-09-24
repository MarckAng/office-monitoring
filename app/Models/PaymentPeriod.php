<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentPeriod extends Model
{
    protected $fillable = ['from_month', 'to_month', 'year', 'open', 'display_order'];

    protected function casts(): array
    {
        return [
            'open' => 'boolean',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(PaymentItem::class, 'payment_period_id')->orderBy('display_order');
    }

    public function getStatusAttribute(): string
    {
        if ($this->items->isEmpty()) return 'empty';

        // On-hold anywhere in the period is the most urgent signal
        if ($this->items->contains('status', 'on-hold')) return 'on-hold';

        if ($this->items->every(fn($i) => $i->status === 'paid')) return 'paid';
        if ($this->items->contains('status', 'process')) return 'process';
        if ($this->items->every(fn($i) => $i->status === 'pending')) return 'pending';

        return 'partial';
    }
}
