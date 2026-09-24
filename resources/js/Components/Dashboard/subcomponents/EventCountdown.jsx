export default function EventCountdown({ events }) {
    if (!Array.isArray(events) || events.length === 0) {
        return null;
    }

    // Normalise to yyyy-MM-dd, stripping any ISO timestamp
    const toDateString = (d) => {
        if (!d) return '';
        const s = String(d);
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        if (s.includes('T')) return s.split('T')[0];
        const parsed = new Date(s);
        if (isNaN(parsed)) return '';
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = toDateString(new Date());

    // Find the next event whose end_date (or start_date) is today or later
    const nextEvent = [...events]
        .filter((e) => {
            const end = toDateString(e.end_date) || toDateString(e.start_date);
            return end >= today;
        })
        .sort((a, b) => toDateString(a.start_date).localeCompare(toDateString(b.start_date)))[0];

    if (!nextEvent) {
        return null;
    }

    const start = toDateString(nextEvent.start_date);
    const end = toDateString(nextEvent.end_date) || start;

    // Friendly display: "Sep 24" or "Sep 24 – Sep 26"
    const formatDisplay = () => {
        if (!start) return '';
        const [sy, sm, sd] = start.split('-').map(Number);
        const startDate = new Date(sy, sm - 1, sd);
        const shortStart = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (start === end) return shortStart;
        const [ey, em, ed] = end.split('-').map(Number);
        const endDate = new Date(ey, em - 1, ed);
        const shortEnd = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${shortStart} – ${shortEnd}`;
    };

    return (
        <p className="mb-4 text-sm text-cyan-200">
            Next event: <span className="font-semibold">{nextEvent.title}</span> — {formatDisplay()}
        </p>
    );
}