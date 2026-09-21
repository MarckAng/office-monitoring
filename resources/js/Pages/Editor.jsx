import React, { useState } from 'react';
import EventsManager from '../Components/Editor/EventsManager';
import TaskManager from '../Components/Editor/TaskManager';
import { 
  PlusIcon, 
  TrashIcon, 
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function Editor({ divisions: initialDivisions, urgent: initialUrgent, events: initialEvents, payments: initialPayments }) {
    const normalizeDivisions = (divs) => (divs || []).map(div => ({
        ...div,
        tasks: (div.tasks || []).map(task => ({
            ...task,
            due_date: task.due_date
                ? (task.due_date.includes('T') ? task.due_date.split('T')[0] : task.due_date)
                : ''
        }))
    }));

    const [divisions, setDivisions] = useState(normalizeDivisions(initialDivisions));
    const [urgent, setUrgent] = useState(initialUrgent || []);
    // Strip ISO timestamps on load so date inputs work correctly
    const normalizeEvents = (evs) => (evs || []).map(e => ({
        ...e,
        date: e.date ? (e.date.includes('T') ? e.date.split('T')[0] : e.date) : ''
    }));

    const [events, setEvents] = useState(normalizeEvents(initialEvents));
    const [payments, setPayments] = useState(initialPayments || []);
    const [activeTab, setActiveTab] = useState('tasks');
    const [expandedPeriods, setExpandedPeriods] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const tabs = [
        { id: 'tasks', name: '📋 Division Tasks' },
        { id: 'urgent', name: '🔥 Urgent Items' },
        { id: 'events', name: '📅 Events' },
        { id: 'payments', name: '💳 Payments' },
    ];
    
    // Task management - passed to TaskManager
    const updateTask = (divisionId, taskId, field, value) => {
        setDivisions(prev => prev.map(div => {
            if (div.id === divisionId) {
                return {
                    ...div,
                    tasks: div.tasks.map(task => 
                        task.id === taskId ? { ...task, [field]: value } : task
                    )
                };
            }
            return div;
        }));
    };
    
    const addTask = (divisionId) => {
        const newTask = {
            id: Date.now(),
            title: 'New Task',
            status: 'pending',
            due_date: new Date().toISOString().split('T')[0],
            display_order: 999
        };
        setDivisions(prev => prev.map(div => 
            div.id === divisionId 
                ? { ...div, tasks: [...div.tasks, newTask] }
                : div
        ));
    };
    
    const deleteTask = (divisionId, taskId) => {
        if (confirm('Delete this task?')) {
            setDivisions(prev => prev.map(div => 
                div.id === divisionId 
                    ? { ...div, tasks: div.tasks.filter(task => task.id !== taskId) }
                    : div
            ));
        }
    };
    
    // Urgent management
    const updateUrgent = (id, field, value) => {
        setUrgent(prev => prev.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };
    
    const addUrgent = () => {
        const newUrgent = {
            id: Date.now(),
            title: 'New Urgent Task',
            division: '',
            priority: 'medium',
            due: 'Today',
            display_order: urgent.length
        };
        setUrgent([...urgent, newUrgent]);
    };
    
    const deleteUrgent = (id) => {
        if (confirm('Delete this urgent item?')) {
            setUrgent(prev => prev.filter(item => item.id !== id));
        }
    };
    
    const updatePaymentPeriod = (periodId, field, value) => {
        let processedValue = value;
        if (field === 'year') {
            // Force it to be a number
            processedValue = parseInt(value);
            if (isNaN(processedValue)) {
                processedValue = new Date().getFullYear();
            }
        }
        
        setPayments(prev => prev.map(period => 
            period.id === periodId ? { ...period, [field]: processedValue } : period
        ));
    };
        
    const addPaymentPeriod = () => {
        const newPeriod = {
            id: Date.now(),
            from_month: 'January',
            to_month: 'February',
            year: new Date().getFullYear(), // This returns a number like 2026
            open: true,
            items: [],
            display_order: payments.length
        };
        setPayments([...payments, newPeriod]);
        setExpandedPeriods(prev => ({ ...prev, [newPeriod.id]: true }));
    };
    
    const deletePaymentPeriod = (periodId) => {
        if (confirm('Delete this payment period and all its items?')) {
            setPayments(prev => prev.filter(p => p.id !== periodId));
        }
    };
    
    const addPaymentItem = (periodId) => {
        const newItem = {
            id: Date.now(),
            name: 'New Service',
            status: 'pending',
            display_order: 999
        };
        setPayments(prev => prev.map(period => 
            period.id === periodId 
                ? { ...period, items: [...(period.items || []), newItem] }
                : period
        ));
    };
    
    const updatePaymentItem = (periodId, itemId, field, value) => {
        setPayments(prev => prev.map(period => 
            period.id === periodId 
                ? { ...period, items: period.items.map(item => 
                    item.id === itemId ? { ...item, [field]: value } : item
                )}
                : period
        ));
    };
    
    const deletePaymentItem = (periodId, itemId) => {
        setPayments(prev => prev.map(period => 
            period.id === periodId 
                ? { ...period, items: period.items.filter(item => item.id !== itemId) }
                : period
        ));
    };
    
    const togglePeriod = (periodId) => {
        setExpandedPeriods(prev => ({ ...prev, [periodId]: !prev[periodId] }));
    };
    
    // Strip ISO timestamps to yyyy-MM-dd
    const stripDate = (d) => (d ? String(d).split('T')[0] : null);

    const buildPayloads = () => {
        const formattedDivisions = divisions.map(div => ({
            ...div,
            tasks: div.tasks.map(task => ({
                ...task,
                due_date: stripDate(task.due_date),
            })),
        }));

        const formattedPayments = payments.map(period => {
            let year = parseInt(period.year, 10);
            if (isNaN(year)) year = new Date().getFullYear();
            return {
                id: period.id,
                from_month: period.from_month || 'January',
                to_month: period.to_month || 'February',
                year,
                open: period.open !== undefined ? period.open : true,
                items: (period.items || []).map(item => ({
                    id: item.id,
                    name: item.name || 'New Service',
                    status: item.status || 'pending',
                })),
            };
        });

        const today = new Date().toISOString().split('T')[0];
        const formattedEvents = (events || []).map(event => ({
            ...event,
            date: event.date ? String(event.date).split('T')[0] : today,
        }));

        return { formattedDivisions, formattedPayments, formattedEvents };
    };

    // POST JSON with Laravel's CSRF token included (reads it from the page meta tag)
    const postJson = async (url, payload, label) => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': token,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let detail = '';
            try {
                const body = await res.json();
                detail = body.message || JSON.stringify(body);
            } catch {
                detail = await res.text();
            }
            throw new Error(`${label} failed (${res.status}): ${detail}`);
        }
        return res;
    };

    const saveAll = async () => {
        setSaving(true);
        setSaveMessage('');

        const { formattedDivisions, formattedPayments, formattedEvents } = buildPayloads();

        console.log('📤 Sending divisions:', formattedDivisions);
        console.log('📤 Sending urgent:', urgent);
        console.log('📤 Sending events:', formattedEvents);
        console.log('📤 Sending payments:', formattedPayments);

        try {
            await postJson('/api/tasks',    { divisions: formattedDivisions }, 'Tasks');
            await postJson('/api/urgent',   { urgent },                       'Urgent');
            await postJson('/api/events',   { events: formattedEvents },     'Events');
            await postJson('/api/payments', { payments: formattedPayments }, 'Payments');

            setSaveMessage('✅ All changes saved successfully!');
        } catch (error) {
            console.error('❌ Save error:', error);
            setSaveMessage('❌ ' + error.message);
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(''), 4000);
        }
    };
    
    const getPriorityColor = (priority) => {
        const colors = {
            critical: 'bg-red-400/10 text-red-400 border-red-400/30',
            high: 'bg-orange-400/10 text-orange-400 border-orange-400/30',
            medium: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
        };
        return colors[priority] || colors.medium;
    };
    
    const getPaymentStatusColor = (status) => {
        const colors = {
            paid: 'bg-green-400/10 text-green-400 border-green-400/30',
            process: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
            pending: 'bg-red-400/10 text-red-400 border-red-400/30'
        };
        return colors[status] || colors.pending;
    };
    
    return (
        <div className="min-h-screen bg-[#08111c]">
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 bg-[#08111c]/95 backdrop-blur-lg border-b border-white/10 z-50">
                <div className="flex justify-between items-center px-6 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-amber-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </div>
                        <div>
                            <div className="text-white font-bold text-sm">Task Editor</div>
                            <div className="text-[10px] text-gray-500">Office Monitoring System</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/" className="px-3 py-1.5 rounded text-xs font-mono border border-white/10 text-gray-400 hover:border-cyan-400 hover:text-cyan-400">
                            ← Dashboard
                        </a>
                        <button 
                            onClick={saveAll}
                            disabled={saving}
                            className="px-3 py-1.5 rounded text-xs font-mono bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 disabled:opacity-50 flex items-center gap-1"
                        >
                            💾 {saving ? 'Saving...' : 'Save All'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="pt-16 px-6 pb-6">
                {/* Save Message */}
                {saveMessage && (
                    <div className="fixed bottom-4 right-4 px-4 py-2 rounded-lg bg-gray-800 border border-white/10 text-sm z-50">
                        {saveMessage}
                    </div>
                )}
                
                {/* Tabs */}
                <div className="flex gap-2 border-b border-white/10 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-mono transition-all ${
                                activeTab === tab.id 
                                    ? 'text-cyan-400 border-b-2 border-cyan-400' 
                                    : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
                
                {/* Tasks Tab - Using TaskManager component */}
                {activeTab === 'tasks' && (
                    <TaskManager 
                        divisions={divisions}
                        onUpdateTask={updateTask}
                        onAddTask={addTask}
                        onDeleteTask={deleteTask}
                    />
                )}
                
                {/* Urgent Tab */}
                {activeTab === 'urgent' && (
                    <div className="space-y-3">
                        <div className="flex justify-end mb-4">
                            <button 
                                onClick={addUrgent}
                                className="px-3 py-1.5 rounded text-xs font-mono bg-red-400/10 border border-red-400/30 text-red-400 hover:bg-red-400/20"
                            >
                                <PlusIcon className="w-3 h-3 inline mr-1" /> Add Urgent Item
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {urgent.map(item => (
                                <div key={item.id} className="bg-[#0c1a28] rounded-lg border border-white/5 p-3">
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateUrgent(item.id, 'title', e.target.value)}
                                            className="flex-1 bg-[#0f2033] px-3 py-2 rounded text-sm text-gray-300 focus:outline-none border border-white/5"
                                            placeholder="Task title"
                                        />
                                        <input
                                            type="text"
                                            value={item.division || ''}
                                            onChange={(e) => updateUrgent(item.id, 'division', e.target.value)}
                                            className="w-32 bg-[#0f2033] px-3 py-2 rounded text-xs text-gray-300 focus:outline-none border border-white/5"
                                            placeholder="Division"
                                        />
                                        <select
                                            value={item.priority}
                                            onChange={(e) => updateUrgent(item.id, 'priority', e.target.value)}
                                            className={`text-xs font-mono px-2 py-2 rounded border ${getPriorityColor(item.priority)} bg-transparent cursor-pointer`}
                                        >
                                            <option value="critical">Critical</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={item.due}
                                            onChange={(e) => updateUrgent(item.id, 'due', e.target.value)}
                                            className="w-28 bg-[#0f2033] px-3 py-2 rounded text-xs text-gray-300 focus:outline-none border border-white/5"
                                            placeholder="Due (Today/Tomorrow/Date)"
                                        />
                                        <button 
                                            onClick={() => deleteUrgent(item.id)}
                                            className="p-2 rounded hover:bg-red-500/10 text-red-400"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {urgent.length === 0 && (
                            <div className="text-center text-gray-500 text-sm py-8">No urgent items. Click "Add Urgent Item" to create one.</div>
                        )}
                    </div>
                )}
                
                {/* Events Tab - Using EventsManager */}
                {activeTab === 'events' && (
                    <EventsManager 
                        events={events} 
                        onEventsChange={(updated) => {
                                const normalized = (updated || []).map(e => ({
                                    ...e,
                                    date: e.date ? String(e.date).split('T')[0] : ''
                                }));
                                setEvents(normalized);
                            }} 
                    />
                )}
                
                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div className="space-y-4">
                        <div className="flex justify-end mb-4">
                            <button 
                                onClick={addPaymentPeriod}
                                className="px-3 py-1.5 rounded text-xs font-mono bg-indigo-400/10 border border-indigo-400/30 text-indigo-400 hover:bg-indigo-400/20"
                            >
                                <PlusIcon className="w-3 h-3 inline mr-1" /> Add Period
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {payments.map(period => (
                                <div key={period.id} className="bg-[#0c1a28] rounded-lg border border-white/5 overflow-hidden">
                                    <div 
                                        className="flex justify-between items-center p-3 bg-[#0f2033] cursor-pointer hover:bg-[#122a3f]"
                                        onClick={() => togglePeriod(period.id)}
                                    >
                                        {!expandedPeriods[period.id] ? (
                                            <div>
                                                <div className="text-sm font-semibold text-white">
                                                    {period.from_month} → {period.to_month} ({period.year})
                                                </div>
                                                <div className="text-xs text-gray-500">{period.items?.length || 0} items</div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-cyan-400">▼ Edit period details below</div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {expandedPeriods[period.id] ? 
                                                <ChevronDownIcon className="w-4 h-4 text-gray-400" /> : 
                                                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                                            }
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deletePaymentPeriod(period.id); }}
                                                className="p-1 rounded hover:bg-red-500/10 text-red-400"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {expandedPeriods[period.id] && (
                                        <div className="p-3 space-y-3">
                                            <div className="flex flex-wrap gap-3 p-3 bg-[#0f2033] rounded-lg border border-white/5">
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-gray-500 block mb-1">From Month</label>
                                                    <select
                                                        value={period.from_month}
                                                        onChange={(e) => updatePaymentPeriod(period.id, 'from_month', e.target.value)}
                                                        className="w-full bg-[#0c1a28] px-3 py-2 rounded text-sm text-white border border-white/5 cursor-pointer"
                                                    >
                                                        {months.map(month => (
                                                            <option key={month} value={month}>{month}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-gray-500 block mb-1">To Month</label>
                                                    <select
                                                        value={period.to_month}
                                                        onChange={(e) => updatePaymentPeriod(period.id, 'to_month', e.target.value)}
                                                        className="w-full bg-[#0c1a28] px-3 py-2 rounded text-sm text-white border border-white/5 cursor-pointer"
                                                    >
                                                        {months.map(month => (
                                                            <option key={month} value={month}>{month}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-32">
                                                    <label className="text-[10px] text-gray-500 block mb-1">Year</label>
                                                    <input
                                                        type="number"
                                                        value={period.year}
                                                        onChange={(e) => updatePaymentPeriod(period.id, 'year', e.target.value)}
                                                        className="w-full bg-[#0c1a28] px-3 py-2 rounded text-sm text-white border border-white/5"
                                                        min="2020"
                                                        max="2030"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="text-xs text-gray-500 mb-2">Payment Items</div>
                                                {period.items?.map(item => (
                                                    <div key={item.id} className="flex items-center gap-2 p-2 bg-[#0f2033] rounded-lg border border-white/5">
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => updatePaymentItem(period.id, item.id, 'name', e.target.value)}
                                                            className="flex-1 bg-transparent text-sm text-gray-300 focus:outline-none"
                                                            placeholder="Service name"
                                                        />
                                                        <select
                                                            value={item.status}
                                                            onChange={(e) => updatePaymentItem(period.id, item.id, 'status', e.target.value)}
                                                            className={`text-xs font-mono px-2 py-1 rounded border ${getPaymentStatusColor(item.status)} bg-transparent cursor-pointer`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="process">Process</option>
                                                            <option value="paid">Paid</option>
                                                        </select>
                                                        <button 
                                                            onClick={() => deletePaymentItem(period.id, item.id)}
                                                            className="p-1 rounded hover:bg-red-500/10 text-red-400"
                                                        >
                                                            <TrashIcon className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button 
                                                    onClick={() => addPaymentItem(period.id)}
                                                    className="w-full p-2 text-xs text-center text-cyan-400 hover:bg-cyan-400/10 rounded border border-dashed border-cyan-400/30 transition-colors"
                                                >
                                                    + Add Item
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {payments.length === 0 && (
                            <div className="text-center text-gray-500 text-sm py-8">No payment periods. Click "Add Period" to create one.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}