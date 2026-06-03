'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import useCartStore from '@/lib/cartStore'

export default function CartFloating() {
  const items    = useCartStore((s) => s.items)
  const [show,   setShow]   = useState(false)
  const [render, setRender] = useState(false)

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal   = items.reduce((s, i) => s + i.price * i.quantity, 0)

  useEffect(() => {
    if (totalItems > 0) {
      setRender(true)
      setTimeout(() => setShow(true), 10)
    } else {
      setShow(false)
      setTimeout(() => setRender(false), 300)
    }
  }, [totalItems])

  if (!render) return null

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-40 transition-all duration-300 ${show ? 'slide-up' : 'translate-y-full opacity-0'}`}>
      <div className="max-w-lg mx-auto bg-navy rounded-2xl shadow-float flex items-center gap-3 p-4">
        {/* Cart info */}
        <div className="flex-1">
          <p className="text-white text-sm font-semibold">
            🛒 {totalItems} barang dipilih
          </p>
          <p className="text-gold font-bold text-base">{formatRupiah(subtotal)}</p>
        </div>

        {/* Detail expand */}
        <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-2 flex-1 hidden md:flex">
          {items.slice(0, 3).map((item) => (
            <p key={item.key} className="text-white/70 text-xs line-clamp-1">
              {item.productName} ×{item.quantity}
            </p>
          ))}
          {items.length > 3 && (
            <p className="text-white/50 text-xs">+{items.length - 3} lainnya</p>
          )}
        </div>

        {/* Checkout button */}
        <Link href="/keranjang"
          className="bg-gold text-dark font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gold-dark transition-colors shrink-0">
          Checkout →
        </Link>
      </div>
    </div>
  )
}
