export default function DivisionsSlide({ divisions, onCopy }) {
    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {divisions.map((division) => <article className="rounded-xl border border-white/10 bg-[#0c1a28] p-5 text-white" key={division.id}><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">{division.name}</h2><span className="text-xs text-cyan-300">{division.abbr}</span></div><ul className="space-y-2">{division.tasks?.map((task) => <li className="flex justify-between gap-2 text-sm text-gray-300" key={task.id}><button className="text-left hover:text-cyan-300" onClick={() => onCopy(task.title)} type="button">{task.title}</button><span className="text-xs">{task.status === 'on-hold' ? 'On Hold' : task.status}</span></li>)}</ul>{!division.tasks?.length && <p className="text-sm text-gray-500">No tasks.</p>}</article>)}
            {!divisions.length && <p className="text-gray-500">No divisions configured.</p>}
        </section>
    );
}
