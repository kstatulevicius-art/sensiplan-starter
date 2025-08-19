export const metadata = {
  title: 'Sensiplan Tracker',
  description: 'Offline-first symptothermal fertility tracker using Sensiplan',
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}