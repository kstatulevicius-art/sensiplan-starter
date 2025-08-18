'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Header(){
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className={`sticky top-0 z-40 ${scrolled ? 'header-glass' : 'bg-transparent'}`}>
      <div className="container py-4 flex flex-col items-center justify-center gap-3 md:flex-row md:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">Sensiplan</Link>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
          <Link href="/how-it-works" className="hover:underline">How it works</Link>
          <Link href="/algorithm" className="hover:underline">Algorithm</Link>
          <Link href="/demo" className="hover:underline">Demo</Link>
          <Link href="/app" className="btn">Open App</Link>
        </nav>
      </div>
    </div>
  )
}
