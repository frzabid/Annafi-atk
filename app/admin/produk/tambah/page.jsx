'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function TambahProduk() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [images,     setImages]     = useState([])   // [{url, path}]
  const [errors,     setErrors]     = useState({})
  const [form, setForm] = useState({
    name: '', slug: '', description: '', sku: '',
    price: '', price_compare: '', stock: '0',
    category_id: '', is_active: true, is_featured: false,
  })

  useEffect(() => {
    supabase.from('categories').select('id,name').eq('is_active', true).order('sort_order')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  const set = (k, v) => setForm((f) => ({
    ...f, [k]: v,
    ...(k === 'name' ? { slug: slugify(v) } : {}),
  }))

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

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Nama wajib diisi'
    if (!form.slug.trim())  e.slug  = 'Slug wajib diisi'
    if (!form.price)        e.price = 'Harga wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const { data: product, error } = await supabase.from('products').insert({
      name:          form.name.trim(),
      slug:          form.slug.trim(),
      description:   form.description.trim() || null,
      sku:           form.sku.trim() || null,
      price:         Number(form.price),
      price_compare: form.price_compare ? Number(form.price_compare) : null,
      stock:         Number(form.stock),
      category_id:   form.category_id || null,
      is_active:     form.is_active,
      is_featured:   form.is_featured,
    }).select().single()

    if (error) {
      alert('Gagal menyimpan: ' + error.message)
      setLoading(false)
      return
    }

    // Insert images
    if (images.length > 0) {
      await supabase.from('product_images').insert(
        images.map((img, i) => ({
          product_id: product.id,
          image_url:  img.url,
          is_primary: i === 0,
          sort_order: i,
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

        {/* Foto produk */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="font-bold text-dark mb-4">📸 Foto Produk</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((img, i) => (
              <div key={img.path} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {i === 0 && <span className="absolute top-1 left-1 bg-ocean text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Utama</span>}
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-coral text-white w-5 h-5 rounded-full text-xs flex items-center justify-center hover:bg-red-600">✕</button>
              </div>
            ))}
            <label className={`w-24 h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-ocean hover:bg-surface transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <span className="text-2xl">📷</span>
              <span className="text-xs text-muted">{uploading ? 'Upload...' : 'Tambah Foto'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-muted">Foto pertama akan dijadikan foto utama. Maksimal ukuran file 5MB.</p>
        </div>

        {/* Info dasar */}
        <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
          <h2 className="font-bold text-dark">📝 Informasi Produk</h2>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Nama Produk <span className="text-coral">*</span></label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="Contoh: Print Hitam Putih A4"
              className={`w-full border-2 px-4 py-3 rounded-xl text-sm outline-none transition-colors ${errors.name ? 'border-coral' : 'border-border focus:border-ocean'}`} />
            {errors.name && <p className="text-coral text-xs mt-1">⚠️ {errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Slug (URL) <span className="text-coral">*</span></label>
            <input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))}
              placeholder="print-hitam-putih-a4"
              className={`w-full border-2 px-4 py-3 rounded-xl text-sm outline-none transition-colors font-mono ${errors.slug ? 'border-coral' : 'border-border focus:border-ocean'}`} />
            <p className="text-xs text-muted mt-1">URL produk: /produk/{form.slug || '...'}</p>
            {errors.slug && <p className="text-coral text-xs mt-1">⚠️ {errors.slug}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              rows={3} placeholder="Deskripsi singkat produk..."
              className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean resize-none transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">SKU</label>
              <input value={form.sku} onChange={(e) => set('sku', e.target.value)}
                placeholder="PRN-001"
                className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Kategori</label>
              <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)}
                className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean cursor-pointer transition-colors">
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Harga & Stok */}
        <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
          <h2 className="font-bold text-dark">💰 Harga & Stok</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Harga Jual (Rp) <span className="text-coral">*</span></label>
              <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)}
                placeholder="500"
                className={`w-full border-2 px-4 py-3 rounded-xl text-sm outline-none transition-colors ${errors.price ? 'border-coral' : 'border-border focus:border-ocean'}`} />
              {errors.price && <p className="text-coral text-xs mt-1">⚠️ {errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Harga Coret (Rp)</label>
              <input type="number" value={form.price_compare} onChange={(e) => set('price_compare', e.target.value)}
                placeholder="1000 (opsional)"
                className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Stok</label>
            <input type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)}
              placeholder="0"
              className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors" />
            <p className="text-xs text-muted mt-1">Isi 9999 untuk stok tidak terbatas (jasa print, fotokopi, dll)</p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="font-bold text-dark mb-4">⚙️ Pengaturan</h2>
          <div className="space-y-3">
            {[
              { key: 'is_active',   label: 'Produk Aktif',    desc: 'Produk akan tampil di website' },
              { key: 'is_featured', label: 'Produk Unggulan', desc: 'Tampil di halaman beranda' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-3 bg-surface rounded-xl cursor-pointer">
                <div>
                  <p className="font-medium text-sm text-dark">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors relative ${form[key] ? 'bg-ocean' : 'bg-border'}`}
                  onClick={() => set(key, !form[key])}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="btn-primary flex-1 py-4 text-base disabled:opacity-60">
            {loading ? '⏳ Menyimpan...' : '💾 Simpan Produk'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="btn-outline px-6 py-4">Batal</button>
        </div>
      </form>
    </div>
  )
}
