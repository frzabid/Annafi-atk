'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import VarianWarna from '@/components/admin/VarianWarna'

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function InputField({ label, required, error, note, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-dark mb-1.5">
        {label}{required && <span className="text-coral ml-1">*</span>}
      </label>
      {children}
      {note  && <p className="text-xs text-muted mt-1">{note}</p>}
      {error && <p className="text-coral text-xs mt-1">⚠️ {error}</p>}
    </div>
  )
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <label className="flex items-center justify-between p-3 bg-surface rounded-xl cursor-pointer">
      <div>
        <p className="font-medium text-sm text-dark">{label}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <div className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-ocean' : 'bg-border'}`} onClick={onChange}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </label>
  )
}

export default function TambahProduk() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [images,     setImages]     = useState([])
  const [variants,   setVariants]   = useState([])
  const [errors,     setErrors]     = useState({})

  const [name,         setName]         = useState('')
  const [slug,         setSlug]         = useState('')
  const [description,  setDescription]  = useState('')
  const [sku,          setSku]          = useState('')
  const [price,        setPrice]        = useState('')
  const [priceCompare, setPriceCompare] = useState('')
  const [stock,        setStock]        = useState('0')
  const [categoryId,   setCategoryId]   = useState('')
  const [isActive,     setIsActive]     = useState(true)
  const [isFeatured,   setIsFeatured]   = useState(false)

  useEffect(() => {
    supabase.from('categories').select('id,name').eq('is_active', true).order('sort_order')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  const handleNameChange = (val) => { setName(val); setSlug(slugify(val)) }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const ext  = file.name.split('.').pop()
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(path, file, { upsert: false })
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
        setImages((prev) => [...prev, { url: publicUrl, path }])
      }
    }
    setUploading(false)
    e.target.value = ''
  }

  const removeImage = async (idx) => {
    const img = images[idx]
    await supabase.storage.from('products').remove([img.path])
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!name.trim()) er.name  = 'Nama wajib diisi'
    if (!price)       er.price = 'Harga wajib diisi'
    setErrors(er)
    if (Object.keys(er).length) return
    setLoading(true)

    const { data: product, error } = await supabase.from('products').insert({
      name:          name.trim(),
      slug:          slug.trim(),
      description:   description.trim() || null,
      sku:           sku.trim() || null,
      price:         Number(price),
      price_compare: priceCompare ? Number(priceCompare) : null,
      stock:         Number(stock),
      category_id:   categoryId || null,
      is_active:     isActive,
      is_featured:   isFeatured,
    }).select().single()

    if (error) { alert('Gagal: ' + error.message); setLoading(false); return }

    // Simpan foto utama
    if (images.length > 0) {
      await supabase.from('product_images').insert(
        images.map((img, i) => ({
          product_id: product.id, image_url: img.url,
          is_primary: i === 0, sort_order: i,
        }))
      )
    }

    // Simpan varian warna
    if (variants.length > 0) {
      await supabase.from('product_variants').insert(
        variants.map((v) => ({
          product_id:    product.id,
          variant_name:  'Warna',
          variant_value: v.variant_value,
          color_hex:     v.color_hex || null,
          image_url:     v.image_url || null,
          price_diff:    Number(v.price_diff) || 0,
          stock:         Number(v.stock) || 0,
          is_active:     true,
        }))
      )
    }

    router.push('/admin/produk')
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-muted hover:text-dark transition-colors">← Kembali</button>
        <h1 className="text-2xl font-bold text-dark">Tambah Produk</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Foto utama */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="font-bold text-dark mb-1">📸 Foto Utama Produk</h2>
          <p className="text-xs text-muted mb-4">Foto umum produk. Jika ada varian warna, tambahkan foto per warna di bawah.</p>
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((img, i) => (
              <div key={img.path} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {i === 0 && <span className="absolute top-1 left-1 bg-ocean text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Utama</span>}
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-coral text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">✕</button>
              </div>
            ))}
            <label className={`w-24 h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-ocean hover:bg-surface transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <span className="text-2xl">📷</span>
              <span className="text-xs text-muted">{uploading ? 'Upload...' : 'Tambah Foto'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Info produk */}
        <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
          <h2 className="font-bold text-dark">📝 Informasi Produk</h2>

          <InputField label="Nama Produk" required error={errors.name}>
            <input value={name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Kaos Polos Cotton"
              className={`w-full border-2 px-4 py-3 rounded-xl text-sm outline-none transition-colors ${errors.name ? 'border-coral' : 'border-border focus:border-ocean'}`} />
          </InputField>

          <InputField label="Slug (URL)" note={`URL: /produk/${slug || '...'}`}>
            <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="kaos-polos-cotton"
              className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors font-mono" />
          </InputField>

          <InputField label="Deskripsi">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} placeholder="Deskripsi produk..."
              className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean resize-none transition-colors" />
          </InputField>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="SKU">
              <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="PRD-001"
                className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors" />
            </InputField>
            <InputField label="Kategori">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean cursor-pointer transition-colors">
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </InputField>
          </div>
        </div>

        {/* Harga & Stok */}
        <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
          <h2 className="font-bold text-dark">💰 Harga & Stok</h2>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Harga Jual (Rp)" required error={errors.price}>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="89000"
                className={`w-full border-2 px-4 py-3 rounded-xl text-sm outline-none transition-colors ${errors.price ? 'border-coral' : 'border-border focus:border-ocean'}`} />
            </InputField>
            <InputField label="Harga Coret (Rp)">
              <input type="number" value={priceCompare} onChange={(e) => setPriceCompare(e.target.value)} placeholder="120000"
                className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors" />
            </InputField>
          </div>
          <InputField label="Stok" note="Isi 9999 untuk stok tidak terbatas">
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0"
              className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors" />
          </InputField>
        </div>

        {/* ✅ Varian Warna */}
        <VarianWarna variants={variants} onChange={setVariants} />

        {/* Pengaturan */}
        <div className="bg-white rounded-xl shadow-card p-5 space-y-3">
          <h2 className="font-bold text-dark mb-1">⚙️ Pengaturan</h2>
          <Toggle label="Produk Aktif"    desc="Tampil di website"        value={isActive}   onChange={() => setIsActive(!isActive)}     />
          <Toggle label="Produk Unggulan" desc="Tampil di halaman beranda" value={isFeatured} onChange={() => setIsFeatured(!isFeatured)} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 text-base disabled:opacity-60">
            {loading ? '⏳ Menyimpan...' : '💾 Simpan Produk'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline px-6 py-4">Batal</button>
        </div>
      </form>
    </div>
  )
}
