export default function TopBar({ currentTime, onRefresh }) {
    return (
        <header className="fixed inset-x-0 top-0 z-10 flex h-14 items-center justify-between border-b border-white/10 bg-[#08111c]/95 px-5 text-white backdrop-blur">
            <h1 className="text-sm font-bold tracking-wide">Office Monitoring</h1>
            <div className="flex items-center gap-4 text-xs text-gray-400">
                <time>{currentTime.toLocaleTimeString()}</time>
                <button className="rounded border border-cyan-400/40 px-2 py-1 text-cyan-300 hover:bg-cyan-400/10" onClick={onRefresh} type="button">Refresh</button>
            </div>
        </header>
    );
}
