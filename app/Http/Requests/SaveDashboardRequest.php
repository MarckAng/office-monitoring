<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveDashboardRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'divisions' => ['present', 'array', 'max:100'],
            'divisions.*' => ['array:name,abbr,tasks'],
            'divisions.*.name' => ['required', 'string', 'max:255'],
            'divisions.*.abbr' => ['nullable', 'string', 'max:255'],
            'divisions.*.tasks' => ['present', 'array', 'max:500'],
            'divisions.*.tasks.*' => ['array:title,status,due_date'],
            'divisions.*.tasks.*.title' => ['required', 'string', 'max:255'],
            'divisions.*.tasks.*.status' => ['required', 'in:ongoing,pending,on-hold,done'],
            'divisions.*.tasks.*.due_date' => ['nullable', 'date'],
            'urgent' => ['present', 'array', 'max:500'],
            'urgent.*' => ['array:title,division,priority,due'],
            'urgent.*.title' => ['required', 'string', 'max:255'],
            'urgent.*.division' => ['nullable', 'string', 'max:255'],
            'urgent.*.priority' => ['required', 'in:critical,high,medium'],
            'urgent.*.due' => ['nullable', 'string', 'max:255'],
            'events' => ['present', 'array', 'max:500'],
            'events.*' => ['array:title,start_date,end_date,time,location,type'],
            'events.*.title' => ['required', 'string', 'max:255'],
            'events.*.start_date' => ['required', 'date'],
            'events.*.end_date' => ['required', 'date', 'after_or_equal:events.*.start_date'],
            'events.*.time' => ['nullable', 'string', 'max:255'],
            'events.*.location' => ['nullable', 'string', 'max:255'],
            'events.*.type' => ['required', 'in:meeting,activity,event,training,workshop,deadline,seminar,exhibit'],
            'payments' => ['present', 'array', 'max:100'],
            'payments.*' => ['array:from_month,to_month,year,open,items'],
            'payments.*.from_month' => ['required', 'in:January,February,March,April,May,June,July,August,September,October,November,December'],
            'payments.*.to_month' => ['required', 'in:January,February,March,April,May,June,July,August,September,October,November,December'],
            'payments.*.year' => ['required', 'integer', 'between:2000,2100'],
            'payments.*.open' => ['required', 'boolean'],
            'payments.*.items' => ['present', 'array', 'max:500'],
            'payments.*.items.*' => ['array:name,status'],
            'payments.*.items.*.name' => ['required', 'string', 'max:255'],
            'payments.*.items.*.status' => ['required', 'in:pending,process,on-hold,paid'],
        ];
    }
}