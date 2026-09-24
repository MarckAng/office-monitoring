<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveDashboardRequest;
use App\Models\Division;
use App\Models\Event;
use App\Models\PaymentItem;
use App\Models\PaymentPeriod;
use App\Models\UrgentItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class EditorController extends Controller
{
    public function index(): Response
    {
        $divisions = Division::with('tasks')->orderBy('display_order')->get();
        $urgent = UrgentItem::orderBy('display_order')->get();
        $events = Event::orderBy('start_date')->get();               // ← was 'date'
        $payments = PaymentPeriod::with('items')->orderBy('display_order')->get();

        // Format dates as yyyy-MM-dd strings (not ISO timestamps)
        $events->transform(function ($event) {
            $event->start_date = $event->start_date instanceof \DateTime
                ? $event->start_date->format('Y-m-d')
                : (is_string($event->start_date) ? substr($event->start_date, 0, 10) : $event->start_date);

            $event->end_date = $event->end_date instanceof \DateTime
                ? $event->end_date->format('Y-m-d')
                : (is_string($event->end_date) ? substr($event->end_date, 0, 10) : $event->end_date);

            return $event;
        });

        return Inertia::render('Editor', [
            'divisions' => $divisions,
            'urgent' => $urgent,
            'events' => $events,
            'payments' => $payments,
        ]);
    }

    public function saveDashboard(SaveDashboardRequest $request): JsonResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated): void {
            Division::query()->delete();
            UrgentItem::query()->delete();
            Event::query()->delete();
            PaymentItem::query()->delete();
            PaymentPeriod::query()->delete();

            foreach ($validated['divisions'] as $divisionIndex => $divisionData) {
                $division = Division::create([
                    'name' => $divisionData['name'],
                    'abbr' => $divisionData['abbr'] ?? '',
                    'display_order' => $divisionIndex,
                ]);

                foreach ($divisionData['tasks'] as $taskIndex => $taskData) {
                    $division->tasks()->create([
                        'title' => $taskData['title'],
                        'status' => $taskData['status'],
                        'due_date' => $taskData['due_date'] ?? null,
                        'display_order' => $taskIndex,
                    ]);
                }
            }

            foreach ($validated['urgent'] as $index => $item) {
                UrgentItem::create([
                    'title' => $item['title'],
                    'division' => $item['division'] ?? '',
                    'priority' => $item['priority'],
                    'due' => $item['due'] ?? '',
                    'display_order' => $index,
                ]);
            }

            foreach ($validated['events'] as $event) {
                $startDate = $event['start_date'] ?? $event['date'] ?? now()->toDateString();
                $endDate = $event['end_date'] ?? $startDate;

                try {
                    $parsedStart = Carbon::parse($startDate)->toDateString();
                    $parsedEnd = Carbon::parse($endDate)->toDateString();
                } catch (\Exception $e) {
                    $parsedStart = now()->toDateString();
                    $parsedEnd = now()->toDateString();
                }

                Event::create([
                    'title' => $event['title'],
                    'start_date' => $parsedStart,
                    'end_date' => $parsedEnd,
                    'time' => $event['time'] ?? '',
                    'location' => $event['location'] ?? '',
                    'type' => $event['type'],
                ]);
            }

            foreach ($validated['payments'] as $periodIndex => $periodData) {
                $period = PaymentPeriod::create([
                    'from_month' => $periodData['from_month'],
                    'to_month' => $periodData['to_month'],
                    'year' => $periodData['year'],
                    'open' => $periodData['open'],
                    'display_order' => $periodIndex,
                ]);

                foreach ($periodData['items'] as $itemIndex => $item) {
                    $period->items()->create([
                        'name' => $item['name'],
                        'status' => $item['status'],
                        'display_order' => $itemIndex,
                    ]);
                }
            }
        }, attempts: 3);

        DashboardController::clearCache();

        return response()->json(['success' => true]);
    }

    public function saveUrgent(Request $request)
    {
        // Accept 'urgent' key or root-level array
        $data = $request->input('urgent') ?? $request->all();

        if (! is_array($data) || empty($data)) {
            UrgentItem::truncate();

            return response()->json(['success' => true, 'message' => 'No data']);
        }

        UrgentItem::truncate();

        foreach ($data as $index => $item) {
            UrgentItem::create([
                'title' => $item['title'],
                'division' => $item['division'] ?? '',
                'priority' => $item['priority'],
                'due' => $item['due'],
                'display_order' => $index,
            ]);
        }

        DashboardController::clearCache();

        return response()->json(['success' => true]);
    }

    public function saveEvents(Request $request)
    {
        // Accept 'events' key or root-level array
        $data = $request->input('events') ?? $request->all();

        if (! is_array($data) || empty($data)) {
            Event::truncate();

            return response()->json(['success' => true, 'message' => 'No data']);
        }

        Log::info('Saving events:', ['count' => count($data)]);

        Event::truncate();

        foreach ($data as $event) {
            $startDate = $event['start_date'] ?? $event['date'] ?? now()->toDateString();
            $endDate = $event['end_date'] ?? $startDate;

            try {
                $parsedStart = Carbon::parse($startDate)->toDateString();
                $parsedEnd = Carbon::parse($endDate)->toDateString();
            } catch (\Exception $e) {
                $parsedStart = now()->toDateString();
                $parsedEnd = now()->toDateString();
                Log::warning('Invalid date format, using today:', [
                    'start' => $startDate,
                    'end' => $endDate,
                ]);
            }

            Event::create([
                'title' => $event['title'] ?? 'Untitled Event',
                'start_date' => $parsedStart,
                'end_date' => $parsedEnd,
                'time' => $event['time'] ?? '',
                'location' => $event['location'] ?? '',
                'type' => $event['type'] ?? 'event',
            ]);

            Log::info('Event created:', [
                'title' => $event['title'] ?? 'Untitled Event',
                'start_date' => $parsedStart,
                'end_date' => $parsedEnd,
            ]);
        }

        $savedEvents = Event::orderBy('start_date')->get();          // ← was 'date'

        DashboardController::clearCache();

        return response()->json([
            'success' => true,
            'events' => $savedEvents,
        ]);
    }

    public function savePayments(Request $request)
    {
        // Accept 'periods', 'payments', or a root-level array
        $data = $request->input('periods')
            ?? $request->input('payments')
            ?? $request->all();

        // If root-level is an indexed array, use it directly
        if (! is_array($data) || empty($data)) {
            return response()->json(['success' => true, 'message' => 'No data']);
        }

        // Handle case where data is not a list (e.g. single object)
        if (isset($data['from_month'])) {
            $data = [$data];
        }

        Log::info('Saving payments:', ['count' => count($data)]);

        // Delete child rows first, then parent — respects the foreign key constraint.
        PaymentItem::query()->delete();
        PaymentPeriod::query()->delete();

        foreach ($data as $index => $periodData) {
            if (! is_array($periodData)) {
                continue;
            }

            $year = isset($periodData['year']) ? (int) $periodData['year'] : (int) date('Y');
            if ($year < 2000 || $year > 2100) {
                $year = (int) date('Y');
            }

            $period = PaymentPeriod::create([
                'from_month' => $periodData['from_month'] ?? 'January',
                'to_month' => $periodData['to_month'] ?? 'February',
                'year' => $year,
                'open' => $periodData['open'] ?? true,
                'display_order' => $index,
            ]);

            $items = $periodData['items'] ?? [];
            if (is_array($items)) {
                foreach ($items as $itemIndex => $item) {
                    if (! is_array($item)) {
                        continue;
                    }
                    $period->items()->create([
                        'name' => $item['name'] ?? 'New Service',
                        'status' => in_array($item['status'] ?? '', ['pending', 'process', 'on-hold', 'paid'])
                    ? $item['status'] : 'pending',
                        'display_order' => $itemIndex,
                    ]);
                }
            }
        }

        DashboardController::clearCache();

        return response()->json(['success' => true]);
    }
}