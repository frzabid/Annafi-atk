import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'
import ProductActions from './ProductActions'

async function getProducts(search, category) {
  let q = supabaseAdmin
    .from('products')
    .select('*, categories(name), product_images(image_url, is_primary)')
    .order('created_at', { ascending: false })

  if (search)   q = q.ilike('name', `%${search}%`)
  if (category) q = q.eq('category_id', category)

  const { data } = await q.limit(100)
  return data ?? []
}

async function getCategories() {
  const { data } = await supabaseAdmin.from('categories').select('id, name').eq('is_active', true).order('sort_order')
  return data ?? []
}

export default async function AdminProduk({ searchParams }) {
  const search   = searchParams?.search   ?? ''
  const category = searchParams?.category ?? ''
  const [products, categories] = await Promise.all([getProducts(search, category), getCategories()])

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Produk</h1>
          <p className="text-muted text-sm">{products.length} produk ditemukan</p>
        </div>
        <Link href="/admin/produk/tambah" className="btn-primary">➕ Tambah Produk</Link>
      </div>

      {/* Filter */}
      <form className="flex flex-wrap gap-3">
        <input name="search" defaultValue={search} placeholder="🔍 Cari produk..."
          className="border-2 border-border px-4 py-2 rounded-xl text-sm outline-none focus:border-ocean flex-1 min-w-[180px]" />
        <select name="category" defaultValue={category}
          className="border-2 border-border px-4 py-2 rounded-xl text-sm outline-none focus:border-ocean cursor-pointer">
          <option value="">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" className="btn-primary px-5">Filter</button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted">Produk</th>
                <th className="text-left px-4 py-3 font-semibold text-muted hidden md:table-cell">Kategori</th>
                <th className="text-right px-4 py-3 font-semibold text-muted">Harga</th>
                <th className="text-center px-4 py-3 font-semibold text-muted">Stok</th>
                <th className="text-center px-4 py-3 font-semibold text-muted">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-muted">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted">Belum ada produk</td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {p.product_images?.[0]?.image_url
                          ? <img src={p.product_images[0].image_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-lg">📦</span>}
                      </div>
                      <div>
                        <p className="font-medium text-dark line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted">{p.sku ?? '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{p.categories?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ocean">
                    {new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(p.price)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      p.stock === 0 ? 'bg-coral/10 text-coral' : p.stock < 10 ? 'bg-yellow/20 text-dark' : 'bg-green/10 text-green'
                    }`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.is_active ? 'bg-green/10 text-green' : 'bg-muted/10 text-muted'}`}>
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/produk/${p.id}/edit`}
                        className="text-xs bg-ocean/10 text-ocean px-3 py-1.5 rounded-lg hover:bg-ocean hover:text-white transition-colors font-medium">
                        ✏️ Edit
                      </Link>
                      <ProductActions id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
