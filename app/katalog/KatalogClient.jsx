'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import ProductCard from '@/components/ProductCard'
import CartFloating from '@/components/CartFloating'

export default function KatalogClient({
  products, total, totalPages, currentPage,
  currentCategory, currentSearch, kategori,
}) {
  const router     = useRouter()
  const pathname   = usePathname()
  const [, startT] = useTransition()
  const [search,   setSearch] = useState(currentSearch)

  const go = (params) => {
    const sp = new URLSearchParams()
    if (params.category) sp.set('category', params.category)
    if (params.search)   sp.set('search',   params.search)
    if (params.page > 1) sp.set('page',     String(params.page))
    startT(() => router.push(`${pathname}?${sp.toString()}`))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    go({ category: currentCategory, search, page: 1 })
  }

  return (
    <>
      <div className="page-container py-6 pb-28">

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {kategori.map((kat) => (
            <button key={kat.slug}
              onClick={() => go({ category: kat.slug, search, page: 1 })}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold shrink-0 transition-all ${
                currentCategory === kat.slug
                  ? 'bg-ocean text-white shadow-btn'
                  : 'bg-white text-muted hover:text-ocean hover:bg-sea-light shadow-card'
              }`}>
              <span>{kat.icon}</span>{kat.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Cari produk..."
            className="flex-1 border-2 border-border bg-white px-4 py-2.5 rounded-xl text-sm outline-none focus:border-ocean transition-colors" />
          <button type="submit" className="btn-primary px-5">Cari</button>
        </form>

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-7xl block mb-4">📭</span>
            <p className="font-bold text-xl text-dark mb-1">Produk tidak ditemukan</p>
            <p className="text-muted text-sm">Coba kategori atau kata kunci lain</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button key={pg} onClick={() => go({ category: currentCategory, search, page: pg })}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                      pg === currentPage ? 'bg-ocean text-white shadow-btn' : 'bg-white text-muted hover:bg-sea-light shadow-card'
                    }`}>
                    {pg}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating cart */}
      <CartFloating />
    </>
  )
}
