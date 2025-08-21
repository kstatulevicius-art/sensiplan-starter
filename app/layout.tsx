import './globals.css'
import DensityBoot from './app/DensityBoot'

export const metadata = {
  title: 'Sensiplan Tracker',
  description: 'Offline-first symptothermal fertility tracker using Sensiplan',
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased">
        <DensityBoot />
        <div className="app-container mx-auto max-w-5xl px-4 py-4">
          {children}
        </div>
      </body>
    </html>
  )
}
