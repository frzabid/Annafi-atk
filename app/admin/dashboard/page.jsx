import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

async function getStats() {
  const [{ count: totalProduk }, { count: totalKategori }, { count: totalOrder }] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
  ])
  const { data: recentOrders } = await supabaseAdmin
    .from('orders').select('*').order('created_at', { ascending: false }).limit(5)
  const { data: lowStock } = await supabaseAdmin
    .from('products').select('name, stock').lt('stock', 10).eq('is_active', true).order('stock').limit(5)
  return { totalProduk, totalKategori, totalOrder, recentOrders: recentOrders ?? [], lowStock: lowStock ?? [] }
}

export default async function Dashboard() {
  const { totalProduk, totalKategori, totalOrder, recentOrders, lowStock } = await getStats()

  const STATS = [
    { icon: '📦', label: 'Total Produk',   value: totalProduk,   color: 'bg-ocean/10 text-ocean',   href: '/admin/produk'   },
    { icon: '🗂️', label: 'Kategori',       value: totalKategori, color: 'bg-purple/10 text-purple', href: '/admin/kategori' },
    { icon: '📋', label: 'Total Pesanan',  value: totalOrder,    color: 'bg-green/10 text-green',   href: '#'               },
  ]

  const statusColor = {
    pending:    'bg-yellow/20 text-dark',
    confirmed:  'bg-ocean/10 text-ocean',
    processing: 'bg-purple/10 text-purple',
    done:       'bg-green/10 text-green',
    cancelled:  'bg-coral/10 text-coral',
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Selamat datang di panel admin Annafi Print</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5">
            <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-dark">{s.value ?? 0}</p>
            <p className="text-muted text-sm">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark">Pesanan Terbaru</h2>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">Belum ada pesanan</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div>
                    <p className="font-semibold text-sm text-dark">{o.order_number}</p>
                    <p className="text-xs text-muted">{o.customer_name} • {o.customer_phone}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[o.status] ?? 'bg-surface'}`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="font-bold text-dark mb-4">⚠️ Stok Hampir Habis</h2>
          {lowStock.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">Semua stok aman ✅</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <p className="text-sm font-medium text-dark line-clamp-1">{p.name}</p>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.stock === 0 ? 'bg-coral/10 text-coral' : 'bg-yellow/20 text-dark'}`}>
                    {p.stock === 0 ? 'Habis' : `Sisa ${p.stock}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-card p-5">
        <h2 className="font-bold text-dark mb-4">Aksi Cepat</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/produk/tambah" className="btn-primary">➕ Tambah Produk</Link>
          <Link href="/admin/kategori"      className="btn-outline">🗂️ Kelola Kategori</Link>
          <Link href="/" target="_blank"    className="btn-outline">🌐 Lihat Website</Link>
        </div>
      </div>
    </div>
  )
}
