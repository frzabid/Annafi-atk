'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// ✅ Di luar komponen utama — cegah bug focus hilang
function VarianRow({ varian, index, onChange, onRemove, onUpload, uploading }) {
  return (
    <div className="p-4 bg-surface rounded-xl border-2 border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-dark">Warna {index + 1}</span>
        <button type="button" onClick={onRemove}
          className="text-xs text-coral hover:underline">🗑️ Hapus</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Nama warna */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Nama Warna</label>
          <input
            value={varian.variant_value}
            onChange={(e) => onChange('variant_value', e.target.value)}
            placeholder="Contoh: Merah, Biru"
            className="w-full border-2 border-border px-3 py-2 rounded-lg text-sm outline-none focus:border-ocean transition-colors"
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Kode Warna</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={varian.color_hex || '#000000'}
              onChange={(e) => onChange('color_hex', e.target.value)}
              className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer p-0.5"
            />
            <input
              value={varian.color_hex || ''}
              onChange={(e) => onChange('color_hex', e.target.value)}
              placeholder="#000000"
              className="flex-1 border-2 border-border px-3 py-2 rounded-lg text-sm outline-none focus:border-ocean transition-colors font-mono"
            />
          </div>
        </div>

        {/* Harga tambahan */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Harga Tambahan (Rp)</label>
          <input
            type="number"
            value={varian.price_diff}
            onChange={(e) => onChange('price_diff', e.target.value)}
            placeholder="0"
            className="w-full border-2 border-border px-3 py-2 rounded-lg text-sm outline-none focus:border-ocean transition-colors"
          />
        </div>

        {/* Stok */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Stok</label>
          <input
            type="number"
            value={varian.stock}
            onChange={(e) => onChange('stock', e.target.value)}
            placeholder="0"
            className="w-full border-2 border-border px-3 py-2 rounded-lg text-sm outline-none focus:border-ocean transition-colors"
          />
        </div>
      </div>

      {/* Foto warna */}
      <div>
        <label className="block text-xs font-semibold text-muted mb-2">Foto untuk Warna Ini</label>
        <div className="flex items-center gap-3">
          {varian.image_url ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-border shrink-0">
              <img src={varian.image_url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => onChange('image_url', '')}
                className="absolute top-1 right-1 bg-coral text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center">✕</button>
            </div>
          ) : (
            <label className={`w-20 h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-ocean hover:bg-white transition-colors shrink-0 ${uploading === index ? 'opacity-50 pointer-events-none' : ''}`}>
              <span className="text-xl">📷</span>
              <span className="text-[10px] text-muted text-center">{uploading === index ? 'Upload...' : 'Foto'}</span>
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => onUpload(e, index)} disabled={uploading === index} />
            </label>
          )}
          <p className="text-xs text-muted leading-relaxed">
            Upload foto produk untuk warna <strong>{varian.variant_value || 'ini'}</strong>. Foto akan tampil saat warna dipilih.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VarianWarna({ variants, onChange }) {
  const [uploading, setUploading] = useState(null) // index yang sedang upload

  const addVarian = () => {
    onChange([...variants, {
      variant_name:  'Warna',
      variant_value: '',
      color_hex:     '#3B82F6',
      price_diff:    '0',
      stock:         '10',
      image_url:     '',
      is_active:     true,
    }])
  }

  const removeVarian = (idx) => {
    onChange(variants.filter((_, i) => i !== idx))
  }

  const updateVarian = (idx, key, val) => {
    onChange(variants.map((v, i) => i === idx ? { ...v, [key]: val } : v))
  }

  const handleUpload = async (e, idx) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(idx)
    const ext  = file.name.split('.').pop()
    const path = `products/variants/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('products').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
      updateVarian(idx, 'image_url', publicUrl)
    }
    setUploading(null)
    e.target.value = ''
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-dark">🎨 Varian Warna</h2>
          <p className="text-xs text-muted mt-0.5">Opsional — isi jika produk punya pilihan warna</p>
        </div>
        <button type="button" onClick={addVarian}
          className="btn-outline text-xs px-4 py-2">
          ➕ Tambah Warna
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted text-sm">Belum ada varian warna</p>
          <p className="text-muted text-xs mt-1">Klik "Tambah Warna" untuk menambahkan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((v, i) => (
            <VarianRow
              key={i}
              varian={v}
              index={i}
              onChange={(key, val) => updateVarian(i, key, val)}
              onRemove={() => removeVarian(i)}
              onUpload={handleUpload}
              uploading={uploading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
