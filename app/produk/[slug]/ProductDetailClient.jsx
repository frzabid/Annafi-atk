'use client'
import Image from 'next/image'
import { useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import useCartStore from '@/lib/cartStore'

export default function ProductDetailClient({ product, images, variantGroups }) {
  const [activeImg,    setActiveImg]    = useState(0)
  const [selectedVars, setSelectedVars] = useState({})
  const [qty,          setQty]          = useState(1)
  const [added,        setAdded]        = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const selectedVariant = Object.keys(variantGroups).length > 0
    ? product.product_variants?.find((v) =>
        Object.entries(selectedVars).every(([n, val]) => v.variant_name === n && v.variant_value === val)
      ) ?? null : null

  const allChosen = Object.keys(variantGroups).every((n) => selectedVars[n])
  const canAdd    = Object.keys(variantGroups).length === 0 || allChosen
  const price     = product.price + (selectedVariant?.price_diff ?? 0)
  const stock     = selectedVariant ? selectedVariant.stock : product.stock
  const hasDiscount = product.price_compare && product.price_compare > product.price

  const handleAdd = () => {
    if (!canAdd || stock === 0) return
    addItem(product, selectedVariant, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      {/* Image gallery */}
      <div className="space-y-3">
        <div className="relative aspect-square bg-surface rounded-xl2 overflow-hidden">
          {images[activeImg]?.image_url ? (
            <Image src={images[activeImg].image_url} alt={product.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted">
              <span className="text-6xl">📦</span>
              <p className="text-sm">Foto belum tersedia</p>
            </div>
          )}
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-coral text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{Math.round((1 - product.price / product.price_compare) * 100)}%
            </span>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button key={img.id} onClick={() => setActiveImg(i)}
                className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === activeImg ? 'border-ocean' : 'border-transparent hover:border-sea'
                }`}>
                {img.image_url && <Image src={img.image_url} alt="" fill sizes="64px" className="object-cover" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-5">
        {product.categories && (
          <span className="inline-block bg-sea-light text-ocean text-xs font-semibold px-3 py-1 rounded-full">
            {product.categories.name}
          </span>
        )}
        <h1 className="text-2xl font-bold text-dark">{product.name}</h1>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-ocean">{formatRupiah(price)}</span>
          {hasDiscount && <span className="text-muted line-through">{formatRupiah(product.price_compare)}</span>}
        </div>

        <div className="border-t border-border pt-4 space-y-4">
          {/* Variants */}
          {Object.entries(variantGroups).map(([name, variants]) => (
            <div key={name}>
              <p className="text-sm font-semibold text-dark mb-2">
                {name}{selectedVars[name] && <span className="text-ocean ml-2 font-bold">{selectedVars[name]}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button key={v.id} disabled={v.stock === 0}
                    onClick={() => setSelectedVars((p) => ({ ...p, [name]: v.variant_value }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      selectedVars[name] === v.variant_value
                        ? 'bg-ocean text-white border-ocean'
                        : v.stock === 0
                        ? 'border-border text-muted line-through cursor-not-allowed opacity-50'
                        : 'border-border hover:border-ocean text-dark'
                    }`}>
                    {v.variant_value}
                    {v.price_diff > 0 && ` (+${formatRupiah(v.price_diff)})`}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-dark mb-2">Jumlah</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-surface text-lg font-bold">−</button>
                <span className="w-12 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(Math.min(stock || 99, qty + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-surface text-lg font-bold">+</button>
              </div>
              <span className="text-sm text-muted">
                {stock > 0 ? `Stok: ${stock}` : <span className="text-coral font-semibold">Stok habis</span>}
              </span>
            </div>
          </div>

          {/* Add to cart */}
          <button onClick={handleAdd} disabled={!canAdd || stock === 0}
            className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
              added ? 'bg-green text-white' :
              !canAdd || stock === 0 ? 'bg-border text-muted cursor-not-allowed' :
              'bg-ocean text-white hover:bg-navy hover:shadow-btn hover:-translate-y-0.5'
            }`}>
            {added ? '✅ Berhasil ditambahkan!' : !canAdd ? '⚠️ Pilih varian dulu' : stock === 0 ? 'Stok Habis' : '🛒 Tambah ke Keranjang'}
          </button>
        </div>

        {product.description && (
          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-dark mb-2">Deskripsi</p>
            <p className="text-muted text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}
        {product.sku && <p className="text-xs text-muted">SKU: {product.sku}</p>}
      </div>
    </>
  )
}
