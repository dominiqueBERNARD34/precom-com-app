import Client from './Client';

export const metadata = { title: 'Inscription • PRECOM-COM' };

export default function Page() {
  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto grid min-h-[100svh] max-w-7xl place-items-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <h1 className="mb-4 text-4xl font-extrabold leading-tight">
            Inscrivez‑vous <span className="block text-brand-400">à PRECOM‑COM</span>
          </h1>
          <p className="mb-6 text-sm text-slate-300">
            Plan sélectionné : <span className="font-semibold">pro</span>
          </p>
          <Client />
        </div>
      </div>
    </main>
  );
}
