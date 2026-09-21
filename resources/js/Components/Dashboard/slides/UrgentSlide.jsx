export default function UrgentSlide({ urgent }) {
    return <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{urgent.map((item) => <article className="rounded-xl border border-red-400/30 bg-red-400/5 p-5 text-white" key={item.id}><p className="font-semibold">{item.title}</p><p className="mt-2 text-sm text-gray-400">{item.division} · {item.priority} · {item.due}</p></article>)}{!urgent.length && <p className="text-gray-500">No urgent tasks.</p>}</section>;
}
