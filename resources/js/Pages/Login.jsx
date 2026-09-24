import { Form } from '@inertiajs/react';

export default function Login() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#08111c] p-6 text-white">
            <Form action="/login" method="post" className="w-full max-w-md space-y-6 rounded-xl border border-white/10 bg-[#0c1a28] p-6 shadow-2xl">
                {({ errors, processing }) => (
                    <>
                        <div className="space-y-1">
                            <h1 className="text-xl font-bold">Editor sign in</h1>
                            <p className="text-sm text-gray-400">Sign in to manage office-monitoring data.</p>
                        </div>
                        <div className="space-y-4">
                            <label className="block space-y-1 text-sm" htmlFor="email">
                                <span>Email address</span>
                                <input autoComplete="email" className="w-full rounded border border-white/10 bg-[#0f2033] px-3 py-2 outline-none focus:border-cyan-400" id="email" name="email" required type="email" />
                                {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
                            </label>
                            <label className="block space-y-1 text-sm" htmlFor="password">
                                <span>Password</span>
                                <input autoComplete="current-password" className="w-full rounded border border-white/10 bg-[#0f2033] px-3 py-2 outline-none focus:border-cyan-400" id="password" name="password" required type="password" />
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-300" htmlFor="remember">
                                <input id="remember" name="remember" type="checkbox" value="1" />
                                Remember me
                            </label>
                        </div>
                        <button className="w-full rounded bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50" disabled={processing} type="submit">
                            {processing ? 'Signing in…' : 'Sign in'}
                        </button>
                    </>
                )}
            </Form>
        </main>
    );
}
