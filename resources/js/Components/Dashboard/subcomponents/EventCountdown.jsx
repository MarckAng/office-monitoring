export default function EventCountdown({ events }) {
    const nextEvent = [...events].sort((first, second) => new Date(first.date) - new Date(second.date))[0];

    if (!nextEvent) {
        return null;
    }

    return <p className="mb-4 text-sm text-cyan-200">Next event: <span className="font-semibold">{nextEvent.title}</span> — {nextEvent.date}</p>;
}
