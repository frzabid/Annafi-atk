'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const MENU = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard'  },
  { href: '/admin/produk',    icon: '📦', label: 'Produk'     },
  { href: '/admin/kategori',  icon: '🗂️', label: 'Kategori'  },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open,   setOpen] = useState(false)

  if (pathname === '/admin/login') return children

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Annafi Print'

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-navy text-white shrink-0 fixed top-0 left-0 h-full z-40">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🖨️</span>
            <div>
              <p className="font-bold text-sm leading-tight">{storeName}</p>
              <p className="text-sea text-[10px]">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {MENU.map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname.startsWith(href) ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <span>🌐</span> Lihat Website
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-coral/20 hover:text-coral transition-colors">
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-navy flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <span className="text-xl">🖨️</span>
          <span className="font-bold text-white text-sm">{storeName} Admin</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-white p-1">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="absolute left-0 top-14 bottom-0 w-56 bg-navy p-3 space-y-1" onClick={(e) => e.stopPropagation()}>
            {MENU.map(({ href, icon, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname.startsWith(href) ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}>
                <span>{icon}</span>{label}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-coral transition-colors">
              <span>🚪</span> Keluar
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
