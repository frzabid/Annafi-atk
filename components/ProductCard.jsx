'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import useCartStore from '@/lib/cartStore'

export default function ProductCard({ product, index = 0 }) {
  const [added,    setAdded]    = useState(false)
  const [imgError, setImgError] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const image       = product.product_images?.[0]?.image_url
  const hasDiscount = product.price_compare && product.price_compare > product.price
  const discount    = hasDiscount ? Math.round((1 - product.price / product.price_compare) * 100) : 0

  const handleAdd = (e) => {
    e.preventDefault()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={`/produk/${product.slug}`}
      className={`card block overflow-hidden fade-up stagger-${Math.min(index + 1, 6)}`}>
      {/* Image */}
      <div className="relative aspect-square bg-surface overflow-hidden">
        {image && !imgError ? (
          <Image src={image} alt={product.name} fill sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted">
            <span className="text-4xl">📦</span>
            <span className="text-xs">Foto belum tersedia</span>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-coral text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
          {product.stock === 0 && (
            <span className="bg-muted text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Habis</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {product.categories?.name && (
          <span className="text-[10px] font-semibold text-ocean uppercase tracking-wide">{product.categories.name}</span>
        )}
        <h3 className="font-semibold text-sm text-dark leading-snug mt-0.5 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-ocean font-bold text-sm">{formatRupiah(product.price)}</span>
          {hasDiscount && <span className="text-muted text-xs line-through">{formatRupiah(product.price_compare)}</span>}
        </div>
        <button onClick={handleAdd} disabled={product.stock === 0}
          className={`mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            added ? 'bg-green text-white' :
            product.stock === 0 ? 'bg-border text-muted cursor-not-allowed' :
            'bg-ocean text-white hover:bg-navy'
          }`}>
          {added ? '✓ Ditambahkan!' : product.stock === 0 ? 'Stok Habis' : '+ Keranjang'}
        </button>
      </div>
    </Link>
  )
}
