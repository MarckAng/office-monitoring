export default function Toast({ message, type }) {
    if (!message) {
        return null;
    }

    return <div className={`fixed right-5 top-20 z-20 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${type === 'success' ? 'bg-emerald-600' : 'bg-slate-700'}`}>{message}</div>;
}
