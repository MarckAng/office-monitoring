<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\UrgentItem;
use App\Models\Event;
use App\Models\PaymentPeriod;
use App\Models\PaymentItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Http\Controllers\DashboardController;

class EditorController extends Controller
{

    public function index()
    {
        $divisions = Division::with('tasks')->orderBy('display_order')->get();
        $urgent = UrgentItem::orderBy('display_order')->get();
        $events = Event::orderBy('date')->get();
        $payments = PaymentPeriod::with('items')->orderBy('display_order')->get();
        
        // Format dates as yyyy-MM-dd strings (not ISO timestamps)
        $events->transform(function($event) {
            $event->date = $event->date instanceof \DateTime
                ? $event->date->format('Y-m-d')
                : (is_string($event->date) ? substr($event->date, 0, 10) : $event->date);
            return $event;
        });
        
        return Inertia::render('Editor', [
            'divisions' => $divisions,
            'urgent' => $urgent,
            'events' => $events,
            'payments' => $payments,
        ]);
    }
    public function saveTasks(Request $request)
    {
        // Accept 'divisions' key or root-level array
        $data = $request->input('divisions') ?? $request->all();

        if (!is_array($data) || empty($data)) {
            return response()->json(['success' => true, 'message' => 'No data']);
        }

        foreach ($data as $divisionData) {
            if (!is_array($divisionData)) continue;
            $division = Division::find($divisionData['id']);
            if ($division) {
                $division->tasks()->delete();
                foreach ($divisionData['tasks'] as $index => $taskData) {
                    $division->tasks()->create([
                        'title' => $taskData['title'],
                        'status' => $taskData['status'],
                        'due_date' => $taskData['due_date'] ?? null,
                        'display_order' => $index
                    ]);
                }
            }
        }

        DashboardController::clearCache();
        return response()->json(['success' => true]);
    }
    
    public function saveUrgent(Request $request)
    {
        // Accept 'urgent' key or root-level array
        $data = $request->input('urgent') ?? $request->all();

        if (!is_array($data) || empty($data)) {
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
                'display_order' => $index
            ]);
        }

        DashboardController::clearCache();
        return response()->json(['success' => true]);
    }
    
    public function saveEvents(Request $request)
    {
        // Accept 'events' key or root-level array
        $data = $request->input('events') ?? $request->all();

        if (!is_array($data) || empty($data)) {
            Event::truncate();
            return response()->json(['success' => true, 'message' => 'No data']);
        }

        Log::info('Saving events:', ['count' => count($data)]);

        Event::truncate();
        
        foreach ($data as $event) {
            $date = $event['date'] ?? now()->toDateString();
            try {
                $parsedDate = Carbon::parse($date)->toDateString();
            } catch (\Exception $e) {
                $parsedDate = now()->toDateString();
                Log::warning('Invalid date format, using today:', ['original' => $date]);
            }
            
            Event::create([
                'title' => $event['title'] ?? 'Untitled Event',
                'date' => $parsedDate,
                'time' => $event['time'] ?? '',
                'location' => $event['location'] ?? '',
                'type' => $event['type'] ?? 'event'
            ]);
            
            Log::info('Event created:', [
                'title' => $event['title'] ?? 'Untitled Event',
                'date' => $parsedDate,
                'time' => $event['time'] ?? '',
                'location' => $event['location'] ?? '',
                'type' => $event['type'] ?? 'event'
            ]);
        }

        $savedEvents = Event::orderBy('date')->get();

        DashboardController::clearCache();
        return response()->json([
            'success' => true,
            'events' => $savedEvents
        ]);
    }
    
    public function savePayments(Request $request)
    {
        // Accept 'periods', 'payments', or a root-level array
        $data = $request->input('periods')
            ?? $request->input('payments')
            ?? $request->all();

        // If root-level is an indexed array, use it directly
        if (!is_array($data) || empty($data)) {
            return response()->json(['success' => true, 'message' => 'No data']);
        }

        // Handle case where data is not a list (e.g. single object)
        if (isset($data['from_month'])) {
            $data = [$data];
        }

        Log::info('Saving payments:', ['count' => count($data)]);

        // Delete child rows first, then parent — respects the foreign key constraint.
        // Using delete() instead of truncate() avoids MySQL's FK-truncate restriction entirely.
        PaymentItem::query()->delete();
        PaymentPeriod::query()->delete();

        foreach ($data as $index => $periodData) {
            if (!is_array($periodData)) continue;

            $year = isset($periodData['year']) ? (int) $periodData['year'] : (int) date('Y');
            if ($year < 2000 || $year > 2100) $year = (int) date('Y');

            $period = PaymentPeriod::create([
                'from_month'    => $periodData['from_month'] ?? 'January',
                'to_month'      => $periodData['to_month']   ?? 'February',
                'year'          => $year,
                'open'          => $periodData['open'] ?? true,
                'display_order' => $index,
            ]);

            $items = $periodData['items'] ?? [];
            if (is_array($items)) {
                foreach ($items as $itemIndex => $item) {
                    if (!is_array($item)) continue;
                    $period->items()->create([
                        'name'          => $item['name']   ?? 'New Service',
                        'status'        => in_array($item['status'] ?? '', ['pending','process','paid'])
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