import Link from 'next/link'
export default function Home(){
  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Sensiplan Tracker</h1>
        <p className="text-slate-600">Open the app</p>
        <Link href="/app" className="btn">Go to App</Link>
      </div>
    </main>
  )
}
