'use client'
import Image from 'next/image'
import { useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import useCartStore from '@/lib/cartStore'

export default function ProductDetailClient({ product, images, variantGroups }) {
  const [activeImg,      setActiveImg]      = useState(0)
  const [selectedVars,   setSelectedVars]   = useState({})
  const [qty,            setQty]            = useState(1)
  const [added,          setAdded]          = useState(false)
  const [imgError,       setImgError]       = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  // Variants flat list untuk cari foto per warna
  const allVariants = product.product_variants ?? []
  const colorVariants = allVariants.filter((v) => v.variant_name === 'Warna')

  const selectedVariant = Object.keys(variantGroups).length > 0
    ? allVariants.find((v) =>
        Object.entries(selectedVars).every(([n, val]) => v.variant_name === n && v.variant_value === val)
      ) ?? null
    : null

  const allChosen = Object.keys(variantGroups).every((n) => selectedVars[n])
  const canAdd    = Object.keys(variantGroups).length === 0 || allChosen
  const price     = product.price + (selectedVariant?.price_diff ?? 0)
  const stock     = selectedVariant ? selectedVariant.stock : product.stock
  const hasDiscount = product.price_compare && product.price_compare > product.price

  // Gambar yang ditampilkan: foto varian warna (jika ada) atau foto utama
  const activeVariantImage = selectedVars['Warna']
    ? colorVariants.find((v) => v.variant_value === selectedVars['Warna'])?.image_url
    : null

  const displayImage = activeVariantImage || images[activeImg]?.image_url

  const handleSelectColor = (colorName) => {
    setSelectedVars((prev) => ({ ...prev, 'Warna': colorName }))
    // Cari foto varian dan set sebagai gambar aktif jika tidak ada foto khusus
    const variantImg = colorVariants.find((v) => v.variant_value === colorName)?.image_url
    if (!variantImg) setActiveImg(0)
  }

  const handleAdd = () => {
    if (!canAdd || stock === 0) return
    addItem(product, selectedVariant, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      {/* ── Gambar ── */}
      <div className="space-y-3">
        {/* Gambar utama */}
        <div className="relative aspect-square bg-surface rounded-xl2 overflow-hidden">
          {displayImage && !imgError ? (
            <Image
              src={displayImage}
              alt={product.name}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover transition-all duration-300"
              priority
              onError={() => setImgError(true)}
            />
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
          {/* Label warna aktif */}
          {selectedVars['Warna'] && (
            <span className="absolute bottom-3 left-3 bg-black/50 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
              {selectedVars['Warna']}
            </span>
          )}
        </div>

        {/* Thumbnail foto utama (jika tidak ada varian warna dipilih) */}
        {!activeVariantImage && images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
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

        {/* Thumbnail foto per varian warna */}
        {colorVariants.some((v) => v.image_url) && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {colorVariants.filter((v) => v.image_url).map((v) => (
              <button key={v.id} onClick={() => handleSelectColor(v.variant_value)}
                className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedVars['Warna'] === v.variant_value ? 'border-ocean' : 'border-transparent hover:border-sea'
                }`}
                title={v.variant_value}>
                <Image src={v.image_url} alt={v.variant_value} fill sizes="64px" className="object-cover" />
                {v.color_hex && (
                  <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: v.color_hex }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Info Produk ── */}
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

          {/* ✅ Pilihan Warna dengan swatch */}
          {colorVariants.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-dark mb-3">
                Pilih Warna
                {selectedVars['Warna'] && (
                  <span className="text-ocean ml-2 font-bold">— {selectedVars['Warna']}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                {colorVariants.map((v) => (
                  <button
                    key={v.id}
                    disabled={v.stock === 0}
                    onClick={() => handleSelectColor(v.variant_value)}
                    className={`relative flex flex-col items-center gap-1.5 transition-all ${
                      v.stock === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'
                    }`}
                    title={v.variant_value}
                  >
                    {/* Color circle */}
                    <div
                      className={`w-10 h-10 rounded-full border-4 shadow-md transition-all ${
                        selectedVars['Warna'] === v.variant_value
                          ? 'border-ocean scale-110 ring-2 ring-ocean ring-offset-2'
                          : 'border-white hover:border-sea'
                      }`}
                      style={{ backgroundColor: v.color_hex || '#E5E7EB' }}
                    />
                    <span className={`text-[10px] font-medium transition-colors ${
                      selectedVars['Warna'] === v.variant_value ? 'text-ocean' : 'text-muted'
                    }`}>
                      {v.variant_value}
                    </span>
                    {v.stock === 0 && (
                      <span className="absolute -top-1 -right-1 bg-coral text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">✕</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Varian lain (non-warna) */}
          {Object.entries(variantGroups)
            .filter(([name]) => name !== 'Warna')
            .map(([name, variants]) => (
              <div key={name}>
                <p className="text-sm font-semibold text-dark mb-2">
                  {name}
                  {selectedVars[name] && <span className="text-ocean ml-2 font-bold">{selectedVars[name]}</span>}
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
            ))
          }

          {/* Jumlah */}
          <div>
            <p className="text-sm font-semibold text-dark mb-2">Jumlah</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-surface text-lg font-bold">−</button>
                <span className="w-12 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(Math.min(stock || 99, qty + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-surface text-lg font-bold">+</button>
              </div>
              <span className="text-sm text-muted">
                {stock > 0
                  ? `Stok: ${stock}`
                  : <span className="text-coral font-semibold">Stok habis</span>
                }
              </span>
            </div>
          </div>

          {/* Tombol tambah keranjang */}
          <button onClick={handleAdd} disabled={!canAdd || stock === 0}
            className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
              added
                ? 'bg-green text-white'
                : !canAdd || stock === 0
                ? 'bg-border text-muted cursor-not-allowed'
                : 'bg-ocean text-white hover:bg-navy hover:shadow-md hover:-translate-y-0.5'
            }`}>
            {added
              ? '✅ Berhasil ditambahkan!'
              : !canAdd
              ? '⚠️ Pilih warna dulu'
              : stock === 0
              ? 'Stok Habis'
              : '🛒 Tambah ke Keranjang'
            }
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
