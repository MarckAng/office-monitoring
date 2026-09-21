<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\UrgentItem;
use App\Models\Event;
use App\Models\PaymentPeriod;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Cache key used by both index() and clearCache().
     * Keep them in sync — changing one without the other = stale data.
     */
    private const CACHE_KEY = 'dashboard_data';
    private const CACHE_TTL = 300; // seconds (5 minutes)

    /**
     * Render the read-only dashboard.
     */
    public function index()
    {
        $data = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return [
                'divisions' => Division::with('tasks')
                    ->orderBy('display_order')
                    ->get(),

                'urgent' => UrgentItem::orderBy('display_order')->get(),

                'events' => Event::orderBy('date')
                    ->get()
                    ->map(function ($event) {
                        // Normalise to yyyy-MM-dd so the frontend date logic
                        // never gets bitten by ISO timestamps or timezones.
                        $event->date = $event->date instanceof \DateTime
                            ? $event->date->format('Y-m-d')
                            : (is_string($event->date)
                                ? substr($event->date, 0, 10)
                                : $event->date);
                        return $event;
                    }),

                'payments' => PaymentPeriod::with('items')
                    ->orderBy('display_order')
                    ->get(),
            ];
        });

        return Inertia::render('Dashboard', $data);
    }

    /**
     * Bust the dashboard cache.
     * Called by EditorController after any successful save.
     */
    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}