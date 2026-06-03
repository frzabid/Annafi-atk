'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ICONS = ['🖨️','✏️','🎁','🧸','🛒','🎂','📦','📚','🎨','💊','🍔','👗','💻','🔧','🎵','🌿']

function slugify(t) {
  return t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')
}

export default function AdminKategori() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(false)
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form, setForm] = useState({ name:'', slug:'', description:'', icon:'📦', sort_order:'0', is_active:true })

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data ?? [])
  }

  useEffect(() => { load() }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v, ...(k==='name' ? {slug:slugify(v)} : {}) }))

  const openAdd = () => {
    setEditing(null)
    setForm({ name:'', slug:'', description:'', icon:'📦', sort_order: String(categories.length), is_active:true })
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ name:cat.name, slug:cat.slug, description:cat.description??'', icon:cat.icon??'📦', sort_order:String(cat.sort_order), is_active:cat.is_active })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    const payload = { name:form.name.trim(), slug:form.slug.trim(), description:form.description.trim()||null, icon:form.icon, sort_order:Number(form.sort_order), is_active:form.is_active }
    if (editing) {
      await supabase.from('categories').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('categories').insert(payload)
    }
    await load()
    setShowForm(false)
    setLoading(false)
  }

  const handleDelete = async (cat) => {
    if (!confirm(`Hapus kategori "${cat.name}"? Produk dalam kategori ini tidak akan terhapus.`)) return
    await supabase.from('categories').delete().eq('id', cat.id)
    await load()
  }

  const toggleActive = async (cat) => {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    await load()
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Kategori</h1>
          <p className="text-muted text-sm">{categories.length} kategori terdaftar</p>
        </div>
        <button onClick={openAdd} className="btn-primary">➕ Tambah Kategori</button>
      </div>

      {/* Category list */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-muted">Kategori</th>
              <th className="text-left px-4 py-3 font-semibold text-muted hidden md:table-cell">Slug</th>
              <th className="text-center px-4 py-3 font-semibold text-muted">Urutan</th>
              <th className="text-center px-4 py-3 font-semibold text-muted">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-muted">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-muted">Belum ada kategori</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat.icon ?? '📦'}</span>
                    <div>
                      <p className="font-semibold text-dark">{cat.name}</p>
                      {cat.description && <p className="text-xs text-muted line-clamp-1">{cat.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted font-mono text-xs hidden md:table-cell">{cat.slug}</td>
                <td className="px-4 py-3 text-center text-muted">{cat.sort_order}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive(cat)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${cat.is_active ? 'bg-green/10 text-green hover:bg-green/20' : 'bg-muted/10 text-muted hover:bg-muted/20'}`}>
                    {cat.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(cat)}
                      className="text-xs bg-ocean/10 text-ocean px-3 py-1.5 rounded-lg hover:bg-ocean hover:text-white transition-colors font-medium">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(cat)}
                      className="text-xs bg-coral/10 text-coral px-3 py-1.5 rounded-lg hover:bg-coral hover:text-white transition-colors font-medium">
                      🗑️ Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}
          style={{ background:'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-dark mb-5">{editing ? '✏️ Edit Kategori' : '➕ Tambah Kategori'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Icon picker */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic) => (
                    <button key={ic} type="button" onClick={() => set('icon', ic)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === ic ? 'bg-ocean/20 ring-2 ring-ocean' : 'bg-surface hover:bg-border'}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Nama Kategori <span className="text-coral">*</span></label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} required
                  placeholder="Contoh: Print & Fotokopi"
                  className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Slug</label>
                <input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))}
                  placeholder="print-fotokopi"
                  className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors font-mono" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Deskripsi</label>
                <input value={form.description} onChange={(e) => set('description', e.target.value)}
                  placeholder="Deskripsi singkat (opsional)"
                  className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">Urutan</label>
                  <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)}
                    className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors" />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center justify-between p-3 bg-surface rounded-xl cursor-pointer">
                    <span className="text-sm font-semibold text-dark">Aktif</span>
                    <div className={`w-11 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-ocean' : 'bg-border'}`}
                      onClick={() => set('is_active', !form.is_active)}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-60">
                  {loading ? '⏳ Menyimpan...' : '💾 Simpan'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline px-5">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
