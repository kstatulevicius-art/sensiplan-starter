import './globals.css'
import type { ReactNode } from 'react'
import Header from '@/components/Header'

export const metadata = {
  title: 'Sensiplan Tracker (Starter)',
  description: 'Website + offline tracker starter'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0ea5e9" />
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(()=>{});
            });
          }
        `}} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <footer className="container py-10 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Sensiplan Starter • Not a medical device</p>
        </footer>
      </body>
    </html>
  )
}
