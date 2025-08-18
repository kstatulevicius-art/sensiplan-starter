import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "Sensiplan Tracker (Starter)",
  description: "Website + offline tracker starter"
};

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
        <header className="container py-6 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">Sensiplan</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/how-it-works">How it works</Link>
            <Link href="/algorithm">Algorithm</Link>
            <Link href="/demo">Demo</Link>
            <Link href="/app" className="btn no-underline">Open App</Link>
          </nav>
        </header>
        <main className="container pb-20">{children}</main>
        <footer className="container py-10 opacity-70 text-sm">
          <p>© {new Date().getFullYear()} Sensiplan Starter • Not a medical device</p>
        </footer>
      </body>
    </html>
  );
}
