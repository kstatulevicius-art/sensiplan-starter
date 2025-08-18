import Link from "next/link";

export default function Page() {
  return (
    <div className="space-y-8">
      <section className="card">
        <h1 className="text-3xl font-bold mb-3">Track fertility the Sensiplan way</h1>
        <p className="opacity-90">
          Evidence-based symptothermal rules, offline-first, privacy by default.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/app" className="btn">Open Tracker</Link>
          <Link href="/how-it-works" className="btn bg-white/10 hover:bg-white/20">Learn More</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="card"><h3 className="font-semibold mb-2">Offline-first</h3><p>Works without internet; your data stays on your device.</p></div>
        <div className="card"><h3 className="font-semibold mb-2">Explainable</h3><p>Every day shows “why” based on Sensiplan rules.</p></div>
        <div className="card"><h3 className="font-semibold mb-2">Exportable</h3><p>Export/import your data anytime (JSON).</p></div>
      </section>
    </div>
  );
}
