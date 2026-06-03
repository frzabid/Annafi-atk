import { supabase } from '@/lib/supabase'
import KatalogClient from './KatalogClient'

const KATEGORI = [
  { slug: '',               label: 'Semua',           icon: '🔍' },
  { slug: 'print-fotokopi', label: 'Print & Fotokopi', icon: '🖨️' },
  { slug: 'atk',            label: 'ATK',              icon: '✏️' },
  { slug: 'aksesoris',      label: 'Aksesoris',        icon: '🎁' },
  { slug: 'mainan',         label: 'Mainan',           icon: '🧸' },
  { slug: 'sembako',        label: 'Sembako',          icon: '🛒' },
  { slug: 'ulang-tahun',    label: 'Ulang Tahun',      icon: '🎂' },
  { slug: 'lainnya',        label: 'Lainnya',          icon: '📦' },
]

async function getProducts({ category, search, page = 1 }) {
  const limit  = 16
  const offset = (page - 1) * limit

  let query = supabase
    .from('products')
    .select('*, product_images(image_url, is_primary), categories(name, slug)', { count: 'exact' })
    .eq('is_active', true)

  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, count } = await query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { products: data ?? [], total: count ?? 0 }
}

export default async function KatalogPage({ searchParams }) {
  const category = searchParams?.category ?? ''
  const search   = searchParams?.search   ?? ''
  const page     = Number(searchParams?.page ?? 1)

  const { products, total } = await getProducts({ category, search, page })
  const totalPages = Math.ceil(total / 16)
  const activeKat  = KATEGORI.find((k) => k.slug === category) ?? KATEGORI[0]

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-navy">
        <div className="page-container py-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            {activeKat.icon} {activeKat.label === 'Semua' ? 'Semua Produk' : activeKat.label}
          </h1>
          <p className="text-sea text-sm">{total} produk tersedia</p>
        </div>
      </div>

      <KatalogClient
        products={products} total={total} totalPages={totalPages}
        currentPage={page} currentCategory={category} currentSearch={search}
        kategori={KATEGORI}
      />
    </div>
  )
}
