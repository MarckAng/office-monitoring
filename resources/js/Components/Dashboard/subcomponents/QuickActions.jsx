export default function QuickActions({ onAction }) {
    return <button className="fixed bottom-5 right-5 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg" onClick={() => onAction('stats')} type="button">Overview</button>;
}
