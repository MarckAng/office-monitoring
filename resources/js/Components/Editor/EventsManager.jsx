import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function EventsManager({ events: initialEvents, onEventsChange }) {
    const [events, setEvents] = useState(initialEvents || []);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        type: 'event'
    });

    const eventTypes = [
        { value: 'meeting', label: 'Meeting', color: '#69f0ae' },
        { value: 'activity', label: 'Activity', color: '#4fc3f7' },
        { value: 'event', label: 'Event', color: '#b39ddb' },
        { value: 'training', label: 'Training', color: '#ce93d8' },
        { value: 'workshop', label: 'Workshop', color: '#4dd0e1' },
        { value: 'deadline', label: 'Deadline', color: '#ff6b6b' },
        { value: 'seminar', label: 'Seminar', color: '#4fc3f7' },
        { value: 'exhibit', label: 'Exhibit', color: '#4dd0e1' },
    ];

    useEffect(() => {
        if (initialEvents) {
            setEvents(initialEvents);
        }
    }, [initialEvents]);

    // Helper: Get date string in YYYY-MM-DD format without timezone issues
    const getDateString = (date) => {
        if (!date) return '';
        if (typeof date === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
            if (date.includes('T')) return date.split('T')[0];
            return date;
        }
        if (date instanceof Date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return String(date);
    };

    // Effective end date — falls back to start_date if empty
    const getEventEndDate = (event) =>
        getDateString(event.end_date) || getDateString(event.start_date);

    // Events on a specific date (checks if the date falls within [start, end])
    const getEventsForDate = (date) => {
        if (!date) return [];
        const dateStr = getDateString(date);
        return events.filter(event => {
            const start = getDateString(event.start_date);
            const end = getEventEndDate(event);
            return dateStr >= start && dateStr <= end;
        });
    };

    const dateHasEvents = (date) => {
        if (!date) return false;
        return getEventsForDate(date).length > 0;
    };

    const dateHasDeadlines = (date) => {
        if (!date) return false;
        return getEventsForDate(date).some(e => e.type === 'deadline');
    };

    const changeMonth = (delta) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + delta);
        setCurrentMonth(newMonth);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        const startDay = firstDay.getDay();
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const daysInMonth = getDaysInMonth(currentMonth);

    const handleEventChange = (id, field, value) => {
        const updatedEvents = events.map(event =>
            event.id === id ? { ...event, [field]: value } : event
        );
        setEvents(updatedEvents);
        onEventsChange(updatedEvents);
    };

    const addEvent = () => {
        const defaultDate = selectedDate || new Date();
        const dateStr = getDateString(defaultDate);
        setEditingEvent(null);
        setFormData({
            title: '',
            start_date: dateStr,
            end_date: dateStr,
            time: '',
            location: '',
            type: 'event'
        });
        setShowForm(true);
    };

    const editEvent = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            start_date: getDateString(event.start_date),
            end_date: getDateString(event.end_date) || getDateString(event.start_date),
            time: event.time || '',
            location: event.location || '',
            type: event.type
        });
        setShowForm(true);
    };

    const deleteEvent = (id) => {
        if (confirm('Delete this event?')) {
            const updatedEvents = events.filter(event => event.id !== id);
            setEvents(updatedEvents);
            onEventsChange(updatedEvents);
            if (selectedDate && getEventsForDate(selectedDate).length === 0) {
                setSelectedDate(null);
            }
        }
    };

    const saveEvent = () => {
        const normalize = (d) => {
            if (!d) return '';
            if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
            const parsed = new Date(d);
            return isNaN(parsed) ? '' : parsed.toISOString().split('T')[0];
        };

        let start = normalize(formData.start_date) || new Date().toISOString().split('T')[0];
        let end = normalize(formData.end_date) || start;
        if (end < start) end = start;

        const eventData = {
            title: formData.title ? formData.title.trim() : 'Untitled Event',
            start_date: start,
            end_date: end,
            time: formData.time || '',
            location: formData.location || '',
            type: formData.type || 'event'
        };

        if (editingEvent) {
            const updatedEvents = events.map(event =>
                event.id === editingEvent.id ? { ...event, ...eventData } : event
            );
            setEvents(updatedEvents);
            onEventsChange(updatedEvents);
        } else {
            const newEvent = { ...eventData, id: Date.now() };
            const updatedEvents = [...events, newEvent];
            setEvents(updatedEvents);
            onEventsChange(updatedEvents);
        }

        setShowForm(false);
        setEditingEvent(null);
    };

    const getEventColor = (type) => {
        const colors = {
            meeting: '#69f0ae',
            activity: '#4fc3f7',
            event: '#b39ddb',
            training: '#ce93d8',
            workshop: '#4dd0e1',
            deadline: '#ff6b6b',
            seminar: '#4fc3f7',
            exhibit: '#4dd0e1',
        };
        return colors[type] || '#4fc3f7';
    };

    const handleDateClick = (date) => {
        if (!date) return;
        setSelectedDate(prev =>
            prev &&
            prev.getDate() === date.getDate() &&
            prev.getMonth() === date.getMonth() &&
            prev.getFullYear() === date.getFullYear()
                ? null
                : date
        );
    };

    const clearDateFilter = () => setSelectedDate(null);

    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const isDateSelected = (date) => {
        if (!selectedDate || !date) return false;
        return date.getDate() === selectedDate.getDate() &&
               date.getMonth() === selectedDate.getMonth() &&
               date.getFullYear() === selectedDate.getFullYear();
    };

    const isDateInPast = (date) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                const parts = dateStr.split('-');
                const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                if (!isNaN(d)) {
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
            }
            const d = new Date(dateStr);
            if (!isNaN(d)) {
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    };

    // "Sep 24" or "Sep 24 – Sep 26" for ranges
    const formatDateRange = (start, end) => {
        const s = formatDate(start);
        const e = formatDate(end);
        if (!e || s === e) return s;
        return `${s} – ${e}`;
    };

    const getMonthYear = () =>
        currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    const getFilteredEvents = () =>
        selectedDate ? getEventsForDate(selectedDate) : events;

    const filteredEvents = getFilteredEvents();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                    📅 {events.length} events
                </div>
                <button
                    onClick={addEvent}
                    className="px-3 py-1.5 rounded text-xs font-mono bg-blue-400/10 border border-blue-400/30 text-blue-400 hover:bg-blue-400/20 transition-colors"
                >
                    <PlusIcon className="w-3 h-3 inline mr-1" /> Add Event
                </button>
            </div>

            {/* Event Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#0c1a28] rounded-lg border border-white/10 p-6 w-[420px] max-w-full">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            {editingEvent ? 'Edit Event' : 'New Event'}
                        </h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Event title"
                                className="w-full bg-[#0f2033] px-3 py-2 rounded text-sm text-white border border-white/5 focus:outline-none focus:border-blue-400"
                            />

                            {/* Start + End date side by side */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] text-gray-500 block mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => {
                                            const newStart = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                start_date: newStart,
                                                end_date: prev.end_date < newStart ? newStart : prev.end_date,
                                            }));
                                        }}
                                        className="w-full bg-[#0f2033] px-3 py-2 rounded text-sm text-white border border-white/5 focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-gray-500 block mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        min={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full bg-[#0f2033] px-3 py-2 rounded text-sm text-white border border-white/5 focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                            </div>

                            <input
                                type="text"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                placeholder="Time (e.g., 10:00 AM)"
                                className="w-full bg-[#0f2033] px-3 py-2 rounded text-sm text-white border border-white/5 focus:outline-none focus:border-blue-400"
                            />
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Location"
                                className="w-full bg-[#0f2033] px-3 py-2 rounded text-sm text-white border border-white/5 focus:outline-none focus:border-blue-400"
                            />
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-[#0f2033] px-3 py-2 rounded text-sm text-white border border-white/5 focus:outline-none focus:border-blue-400"
                            >
                                {eventTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-3 py-2 rounded text-xs bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEvent}
                                    className="flex-1 px-3 py-2 rounded text-xs bg-blue-400/20 text-blue-400 hover:bg-blue-400/30"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar + List View Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Calendar */}
                <div className="lg:col-span-1 bg-[#0c1a28] rounded-lg border border-white/5 p-3">
                    <div className="flex justify-between items-center mb-2">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <div className="text-sm font-semibold text-white">
                            {getMonthYear()}
                        </div>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-[9px] font-mono text-gray-500 py-0.5">
                                {day}
                            </div>
                        ))}

                        {daysInMonth.map((date, index) => {
                            if (!date) {
                                return <div key={`empty-${index}`} className="aspect-square rounded"></div>;
                            }

                            const hasEvents = dateHasEvents(date);
                            const hasDeadlines = dateHasDeadlines(date);
                            const isSelected = isDateSelected(date);
                            const today = isToday(date);
                            const isPast = isDateInPast(date);

                            let bgClass = "aspect-square rounded flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105";
                            let textClass = "text-xs font-medium";

                            if (isSelected) {
                                bgClass += " bg-cyan-400/30 ring-1 ring-cyan-400/50 hover:bg-cyan-400/40";
                                textClass = "text-cyan-400 font-bold text-xs";
                            } else if (today) {
                                bgClass += " bg-cyan-400/20 border border-cyan-400 hover:bg-cyan-400/30";
                                textClass = "text-cyan-400 font-bold text-xs";
                            } else if (isPast) {
                                bgClass += " hover:bg-white/5";
                                textClass = "text-gray-500 text-xs";
                            } else if (hasDeadlines) {
                                bgClass += " bg-red-500/10 hover:bg-red-500/20";
                                textClass = "text-red-400 font-medium text-xs";
                            } else if (hasEvents) {
                                bgClass += " bg-yellow-500/10 hover:bg-yellow-500/20";
                                textClass = "text-yellow-400 font-medium text-xs";
                            } else {
                                bgClass += " hover:bg-white/5";
                                textClass = "text-gray-500 text-xs";
                            }

                            return (
                                <div
                                    key={date.toISOString()}
                                    onClick={() => handleDateClick(date)}
                                    className={bgClass}
                                >
                                    <span className={textClass}>{date.getDate()}</span>
                                    {hasEvents && (
                                        <div className="flex gap-0.5 mt-0.5">
                                            {getEventsForDate(date).slice(0, 2).map((e, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-1 h-1 rounded-full"
                                                    style={{ backgroundColor: getEventColor(e.type) }}
                                                    title={e.title}
                                                />
                                            ))}
                                            {getEventsForDate(date).length > 2 && (
                                                <span className="text-[6px] text-gray-500">+{getEventsForDate(date).length - 2}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center gap-3 mt-3 pt-2 border-t border-white/5 flex-wrap">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                            <span className="text-[8px] text-gray-400">Today</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-[8px] text-gray-400">Event</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-[8px] text-gray-400">Deadline</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-400/50 ring-1 ring-cyan-400/30"></div>
                            <span className="text-[8px] text-gray-400">Selected</span>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="lg:col-span-2 bg-[#0c1a28] rounded-lg border border-white/5 p-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium text-white">
                            {selectedDate
                                ? `📅 ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                                : '📋 All Events'
                            }
                        </div>
                        {selectedDate && (
                            <button
                                onClick={clearDateFilter}
                                className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Show All ({events.length} events)
                            </button>
                        )}
                    </div>

                    <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                        {(selectedDate ? filteredEvents : events).map(event => (
                            <div key={event.id} className="flex items-center gap-2 p-2 bg-[#0f2033] rounded-lg hover:bg-[#122a3f] transition-colors group">
                                <div
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: getEventColor(event.type) }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-white truncate">{event.title}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                                        <span>{formatDateRange(event.start_date, event.end_date)}</span>
                                        {event.time && <span>• {event.time}</span>}
                                        {event.location && <span>• {event.location}</span>}
                                        <span
                                            className="text-[9px] px-1.5 py-0.5 rounded border"
                                            style={{
                                                background: `${getEventColor(event.type)}18`,
                                                color: getEventColor(event.type),
                                                borderColor: `${getEventColor(event.type)}33`
                                            }}
                                        >
                                            {event.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => editEvent(event)}
                                        className="p-1 rounded hover:bg-blue-500/10 text-blue-400"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => deleteEvent(event.id)}
                                        className="p-1 rounded hover:bg-red-500/10 text-red-400"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(selectedDate ? filteredEvents : events).length === 0 && (
                            <div className="text-center text-gray-500 text-sm py-8">
                                {selectedDate
                                    ? 'No events on this day. Click "Add Event" to create one.'
                                    : 'No events. Click "Add Event" to create one.'
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}