'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import useCartStore from '@/lib/cartStore'

const NAV = [
  { href: '/',          label: 'Beranda',      icon: '🏠' },
  { href: '/katalog',   label: 'Produk',       icon: '📦' },
  { href: '/keranjang', label: 'Keranjang',    icon: '🛒' },
  { href: '/#tentang',  label: 'Tentang Kami', icon: 'ℹ️'  },
]

export default function Navbar() {
  const pathname   = usePathname()
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [count,    setCount]    = useState(0)
  const items = useCartStore((s) => s.items)

  useEffect(() => setCount(items.reduce((s, i) => s + i.quantity, 0)), [items])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Annafi Print'

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-navy shadow-lg' : 'bg-navy/95 backdrop-blur-md'
    }`}>
      <div className="page-container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center text-xl shadow-sm">🖨️</div>
          <div>
            <span className="font-bold text-white text-base leading-tight block">{storeName}</span>
            <span className="text-sea text-[10px] font-medium leading-none">Print & More</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href ? 'text-gold bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}>
              {label}
              {label === 'Keranjang' && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-dark text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/keranjang" className="relative p-2">
            <span className="text-xl">🛒</span>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-dark text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
            )}
          </Link>
          <button onClick={() => setOpen(!open)} className="p-2">
            <div className="w-5 space-y-1.5">
              <span className={`block h-0.5 bg-white transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-navy border-t border-white/10 ${open ? 'max-h-72' : 'max-h-0'}`}>
        <nav className="page-container py-3 flex flex-col gap-1">
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
