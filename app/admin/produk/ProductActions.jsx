'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProductActions({ id, name }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Hapus produk "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return
    setLoading(true)
    const res = await fetch(`/api/admin/produk/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Gagal menghapus produk.')
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="text-xs bg-coral/10 text-coral px-3 py-1.5 rounded-lg hover:bg-coral hover:text-white transition-colors font-medium disabled:opacity-50">
      {loading ? '...' : '🗑️ Hapus'}
    </button>
  )
}
