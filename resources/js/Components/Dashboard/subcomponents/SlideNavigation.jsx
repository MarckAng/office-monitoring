export default function SlideNavigation({ currentSlide, totalSlides, slideName, paused, onPauseToggle }) {
    return (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-white/10 bg-[#0c1a28] p-3 text-white">
            <button className="rounded px-3 py-1 hover:bg-white/10" onClick={() => onPauseToggle('prev')} type="button">Previous</button>
            <div className="text-center"><div className="font-semibold">{slideName}</div><div className="text-xs text-gray-500">{currentSlide + 1} / {totalSlides}</div></div>
            <div className="flex gap-2"><button className="rounded px-3 py-1 hover:bg-white/10" onClick={() => onPauseToggle()} type="button">{paused ? 'Resume' : 'Pause'}</button><button className="rounded px-3 py-1 hover:bg-white/10" onClick={() => onPauseToggle('next')} type="button">Next</button></div>
        </div>
    );
}
