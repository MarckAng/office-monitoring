import React, { useState, useEffect } from 'react';
import TopBar from '../Components/Dashboard/subcomponents/TopBar';
import SlideNavigation from '../Components/Dashboard/subcomponents/SlideNavigation';
import EventCountdown from '../Components/Dashboard/subcomponents/EventCountdown';
import QuickActions from '../Components/Dashboard/subcomponents/QuickActions';
import DivisionsSlide from '../Components/Dashboard/slides/DivisionsSlide';
import UrgentSlide from '../Components/Dashboard/slides/UrgentSlide';
import PaymentsSlide from '../Components/Dashboard/slides/PaymentsSlide';
import Toast from '../Components/Common/Toast';

export default function Dashboard({ divisions, urgent, events, payments }) {
    // Defensive guard: Inertia/empty-state props can arrive as {} instead of [].
    // Normalizing here once means every usage below is safe without repeated checks.
    divisions = Array.isArray(divisions) ? divisions : [];
    urgent    = Array.isArray(urgent)    ? urgent    : [];
    events    = Array.isArray(events)    ? events    : [];
    payments  = Array.isArray(payments)  ? payments  : [];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewMode, setViewMode] = useState('all');
    const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
    
    const slides = ['Division Task Overview', 'Urgent Tasks', 'Activities & Events', 'Payment Tracker'];
    
    // Helper: Get date string in YYYY-MM-DD format without timezone issues
    const getDateString = (date) => {
        if (!date) return '';
        if (typeof date === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return date;
            }
            // ISO timestamp — split to avoid UTC shift
            if (date.includes('T')) return date.split('T')[0];
            try {
                const d = new Date(date);
                if (!isNaN(d)) {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }
            } catch (e) {}
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

    // Effective end date of an event — falls back to start_date for single-day events
    const getEventEndDate = (event) =>
        getDateString(event.end_date) || getDateString(event.start_date);

    // Does a given date fall within the event's [start_date, end_date] range?
    const isDateWithinEvent = (dateStr, event) => {
        const start = getDateString(event.start_date);
        const end = getEventEndDate(event);
        return dateStr >= start && dateStr <= end;
    };
    
    // Toast notification
    const showToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 3000);
    };
    
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
                setPaused(!paused);
                showToast(paused ? '▶ Resumed' : '⏸ Paused', 'info');
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                setCurrentSlide((currentSlide + 1) % slides.length);
                setProgress(0);
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setCurrentSlide((currentSlide - 1 + slides.length) % slides.length);
                setProgress(0);
            }
            if (e.key === 'r' || e.key === 'R') {
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    window.location.reload();
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentSlide, paused, slides.length]);
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    useEffect(() => {
        if (paused) return;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setCurrentSlide((currentSlide + 1) % slides.length);
                    return 0;
                }
                return prev + 2;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [currentSlide, paused]);
    
    // Copy to clipboard
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast(`Copied: "${text}"`, 'success');
        } catch {
            showToast('Unable to copy to the clipboard.', 'error');
        }
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
    
    // Get events that fall on a specific date (checks if date is within [start, end])
    const getEventsForDate = (date) => {
        if (!date) return [];
        const dateStr = getDateString(date);
        return events.filter(e => isDateWithinEvent(dateStr, e));
    };
    
    // Get filtered events based on selected date
    const getFilteredEvents = () => {
        if (!selectedDate) return events;
        return getEventsForDate(selectedDate);
    };
    
    const filteredEvents = getFilteredEvents();
    
    // Calendar navigation
    const changeMonth = (delta) => {
        let newMonth = calendarMonth + delta;
        let newYear = calendarYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        } else if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        setCalendarMonth(newMonth);
        setCalendarYear(newYear);
    };
    
    // Get days in month
    const getDaysInMonth = (month, year) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        const startDay = firstDay.getDay();
        
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        
        return days;
    };
    
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    
    const hasEventsOnDate = (date) => {
        if (!date) return false;
        const dateStr = getDateString(date);
        return events.some(e => isDateWithinEvent(dateStr, e));
    };
    
    const hasDeadlinesOnDate = (date) => {
        if (!date) return false;
        const dateStr = getDateString(date);
        return events.some(e => isDateWithinEvent(dateStr, e) && e.type === 'deadline');
    };
    
    const isDateSelected = (date) => {
        if (!selectedDate || !date) return false;
        return getDateString(date) === getDateString(selectedDate);
    };
    
    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return getDateString(date) === getDateString(today);
    };
    
    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    // Format a date range: "Sep 24" for single day, "Sep 24 – Sep 26" for ranges
    const formatDateRange = (start, end) => {
        const s = getDateString(start);
        const e = getDateString(end) || s;
        if (!s) return '';
        const [sy, sm, sd] = s.split('-').map(Number);
        const [ey, em, ed] = e.split('-').map(Number);
        const startDate = new Date(sy, sm - 1, sd);
        const endDate = new Date(ey, em - 1, ed);
        const shortStart = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (s === e) return shortStart;
        const shortEnd = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${shortStart} – ${shortEnd}`;
    };
    
    const handleDateClick = (date) => {
        if (!date) return;
        const eventsOnDate = getEventsForDate(date);
        if (eventsOnDate.length > 0) {
            setSelectedDate(date);
            setViewMode('day');
            showToast(`📅 Showing ${eventsOnDate.length} event${eventsOnDate.length > 1 ? 's' : ''} for ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`, 'info');
        } else {
            setSelectedDate(date);
            setViewMode('day');
            showToast('No events on this day', 'info');
        }
    };
    
    const clearDateFilter = () => {
        setSelectedDate(null);
        setViewMode('all');
        showToast('📅 Showing all events', 'info');
    };
    
    const getNextEventCountdown = () => {
        if (!Array.isArray(events) || events.length === 0) return null;
        const now = new Date();
        const todayStr = getDateString(now);

        // Any event whose end_date >= today is still upcoming or ongoing
        const upcoming = events
            .filter(e => getEventEndDate(e) >= todayStr)
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        if (upcoming.length === 0) return null;

        const nextStart = new Date(`${getDateString(upcoming[0].start_date)}T00:00:00`);
        const diff = nextStart - now;
        
        if (diff <= 0) return { text: 'Today! 🎉' };
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return { text: `${days}d ${hours}h` };
    };
    
    const nextEventCountdown = getNextEventCountdown();
    
    const handlePauseToggle = (action) => {
        if (action === 'prev') {
            setCurrentSlide((currentSlide - 1 + slides.length) % slides.length);
            setProgress(0);
        } else if (action === 'next') {
            setCurrentSlide((currentSlide + 1) % slides.length);
            setProgress(0);
        } else {
            setPaused(!paused);
        }
    };
    
    const handleQuickAction = (action) => {
        if (action === 'stats') {
            setCurrentSlide(0);
            setProgress(0);
        }
    };
    
    const handleRefresh = () => {
        window.location.reload();
    };
    
    
    return (
        <div className="min-h-screen bg-[#08111c]">
            {/* Toast Notification */}
            <Toast message={toastMessage} type={toastType} />
            
            {/* Top Bar */}
            <TopBar currentTime={currentTime} onRefresh={handleRefresh} />
            
            {/* Progress Bar */}
            <div className="fixed top-[57px] left-0 right-0 h-0.5 bg-white/5">
                <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
            
            {/* Main Content */}
            <div className="pt-20 px-5 pb-5">
                {/* Slide Navigation */}
                <SlideNavigation 
                    currentSlide={currentSlide}
                    totalSlides={slides.length}
                    slideName={slides[currentSlide]}
                    paused={paused}
                    onPauseToggle={handlePauseToggle}
                />
                
                {/* Event Countdown */}
                <EventCountdown events={events} currentSlide={currentSlide} />
                
                {/* Slide 0: Divisions */}
                {currentSlide === 0 && (
                    <DivisionsSlide divisions={divisions} onCopy={copyToClipboard} />
                )}
                
                {/* Slide 1: Urgent */}
                {currentSlide === 1 && (
                    <UrgentSlide urgent={urgent} />
                )}
                
                {/* Slide 2: Events */}
                {currentSlide === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Events List - Left Side */}
                        <div className="lg:col-span-2 bg-[#0c1a28]/50 rounded-xl border border-white/5 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xl">📅</div>
                                    <div>
                                        <h2 className="font-bold text-white">Activities & Events</h2>
                                        <p className="text-[10px] font-mono text-gray-600">
                                            {viewMode === 'day' && selectedDate 
                                                ? formatDate(selectedDate)
                                                : 'All scheduled events'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {viewMode === 'day' && (
                                        <button 
                                            onClick={clearDateFilter}
                                            type="button"
                                            className="px-3 py-1.5 rounded text-xs font-mono bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 transition-colors"
                                        >
                                            Show All
                                        </button>
                                    )}
                                    <span className="text-xs text-gray-500">
                                        {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {filteredEvents.map(event => {
                                    // Use start_date for the big date badge
                                    const startStr = getDateString(event.start_date);
                                    const endStr = getEventEndDate(event);
                                    const isRange = startStr && endStr && startStr !== endStr;

                                    const [sy, sm, sd] = (startStr || '').split('-').map(Number);
                                    const startDateObj = startStr ? new Date(sy, sm - 1, sd) : new Date();
                                    const month = startDateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                                    const day = startDateObj.getDate();

                                    // End day for the range badge (same month shows just a number)
                                    let endDayLabel = '';
                                    if (isRange) {
                                        const [ey, em, ed] = endStr.split('-').map(Number);
                                        const endDateObj = new Date(ey, em - 1, ed);
                                        if (em === sm && ey === sy) {
                                            endDayLabel = `–${ed}`;
                                        } else {
                                            endDayLabel = `–${endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                                        }
                                    }

                                    const eventColor = getEventColor(event.type);
                                    return (
                                        <div key={event.id} className="flex gap-3 p-3 rounded-lg bg-[#0f2033] border border-white/5 hover:border-white/10 transition-all hover:scale-[1.01]">
                                            <div className="text-center min-w-[70px]" style={{ color: eventColor }}>
                                                <div className="text-[10px] font-mono uppercase tracking-wider">{month}</div>
                                                <div className="text-2xl font-bold leading-tight">
                                                    {day}<span className="text-base">{endDayLabel}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white">{event.title}</div>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="text-[9px] font-mono px-2 py-0.5 rounded border" style={{ background: `${eventColor}18`, color: eventColor, borderColor: `${eventColor}33` }}>{event.type}</span>
                                                    {event.time && <span className="text-[9px] font-mono text-gray-500">🕐 {event.time}</span>}
                                                    {isRange && (
                                                        <span className="text-[9px] font-mono text-gray-500">
                                                            📆 {formatDateRange(event.start_date, event.end_date)}
                                                        </span>
                                                    )}
                                                </div>
                                                {event.location && <div className="text-[10px] text-gray-600 mt-1 flex items-center gap-1"><span>📍</span> {event.location}</div>}
                                            </div>
                                            <button aria-label={`Copy ${event.title}`} className="text-gray-600 hover:text-cyan-400 transition-colors text-xs" onClick={() => copyToClipboard(event.title)} title="Copy event name" type="button">📋</button>
                                        </div>
                                    );
                                })}
                                {filteredEvents.length === 0 && (
                                    <div className="text-center text-gray-500 text-sm py-8">
                                        {viewMode === 'day' ? 'No events on this day' : 'No events scheduled'}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Calendar - Right Side */}
                        <div className="bg-[#0c1a28]/50 rounded-xl border border-white/5 p-5">
                            <div className="flex justify-between items-center mb-4">
                                <button 
                                    onClick={() => changeMonth(-1)}
                                    aria-label="Show previous month"
                                    className="p-2 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                    type="button"
                                >
                                    ◀
                                </button>
                                <div className="text-lg font-bold text-white">
                                    {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </div>
                                <button 
                                    onClick={() => changeMonth(1)}
                                    aria-label="Show next month"
                                    className="p-2 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                    type="button"
                                >
                                    ▶
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-7 gap-1">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center text-[10px] font-mono text-gray-500 py-1">
                                        {day}
                                    </div>
                                ))}
                                
                                {daysInMonth.map((date, index) => {
                                    if (!date) {
                                        return <div key={`empty-${index}`} className="aspect-square rounded-lg"></div>;
                                    }
                                    
                                    const hasEvents = hasEventsOnDate(date);
                                    const hasDeadlines = hasDeadlinesOnDate(date);
                                    const isSelected = isDateSelected(date);
                                    const today = isToday(date);
                                    const isPast = date < new Date(new Date().setHours(0,0,0,0));
                                    
                                    let bgClass = "transition-colors cursor-pointer";
                                    let textClass = "text-sm font-medium";
                                    let hoverClass = "hover:scale-105";
                                    
                                    if (isSelected) {
                                        bgClass = "bg-cyan-400/30 ring-2 ring-cyan-400/50 hover:bg-cyan-400/40";
                                        textClass = "text-cyan-400 font-bold";
                                    } else if (today) {
                                        bgClass = "bg-cyan-400/20 border border-cyan-400 hover:bg-cyan-400/30";
                                        textClass = "text-cyan-400 font-bold";
                                    } else if (isPast) {
                                        bgClass = "hover:bg-white/5";
                                        textClass = "text-gray-600";
                                    } else if (hasDeadlines) {
                                        bgClass = "bg-red-500/10 hover:bg-red-500/20";
                                        textClass = "text-red-400 font-medium";
                                    } else if (hasEvents) {
                                        bgClass = "bg-yellow-500/10 hover:bg-yellow-500/20";
                                        textClass = "text-yellow-400 font-medium";
                                    } else {
                                        bgClass = "hover:bg-white/5";
                                        textClass = "text-gray-500";
                                    }
                                    
                                    return (
                                        <button
                                            aria-label={`${date.toLocaleDateString('en-US')}${hasEvents ? `, ${getEventsForDate(date).length} events` : ''}`}
                                            key={date.toISOString()}
                                            onClick={() => handleDateClick(date)}
                                            className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 ${bgClass} ${hoverClass}`}
                                            type="button"
                                        >
                                            <span className={textClass}>{date.getDate()}</span>
                                            {hasEvents && (
                                                <div className="flex gap-0.5 mt-0.5">
                                                    {getEventsForDate(date).slice(0, 2).map((e, idx) => (
                                                        <div 
                                                            key={idx}
                                                            className="w-1.5 h-1.5 rounded-full"
                                                            style={{ backgroundColor: getEventColor(e.type) }}
                                                            title={e.title}
                                                        />
                                                    ))}
                                                    {getEventsForDate(date).length > 2 && (
                                                        <span className="text-[8px] text-gray-500">+{getEventsForDate(date).length - 2}</span>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <div className="flex justify-center gap-4 mt-4 pt-3 border-t border-white/5 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                                    <span className="text-[9px] text-gray-400">Today</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                    <span className="text-[9px] text-gray-400">Event</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                    <span className="text-[9px] text-gray-400">Deadline</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/50 ring-2 ring-cyan-400/30"></div>
                                    <span className="text-[9px] text-gray-400">Selected</span>
                                </div>
                            </div>
                            
                            {selectedDate && (
                                <div className="mt-4 pt-3 border-t border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-xs font-medium text-white">
                                            Events on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                        <button 
                                            onClick={clearDateFilter}
                                            type="button"
                                            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            Show All
                                        </button>
                                    </div>
                                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                                        {getEventsForDate(selectedDate).map(event => (
                                            <div key={event.id} className="flex items-center gap-2 p-1.5 bg-[#0f2033] rounded hover:bg-[#122a3f] transition-colors">
                                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: getEventColor(event.type) }} />
                                                <div className="flex-1 text-[10px] text-gray-300 truncate">{event.title}</div>
                                                {event.time && <div className="text-[9px] text-gray-500 flex-shrink-0">{event.time}</div>}
                                            </div>
                                        ))}
                                        {getEventsForDate(selectedDate).length === 0 && (
                                            <div className="text-[10px] text-gray-500 text-center py-2">No events this day</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Slide 3: Payments */}
                {currentSlide === 3 && (
                    <PaymentsSlide payments={payments} />
                )}
            </div>
            
            {/* Quick Actions */}
            <QuickActions onAction={handleQuickAction} />
        </div>
    );
}