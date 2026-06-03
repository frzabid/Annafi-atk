import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProductDetailClient from './ProductDetailClient'
import ProductCard from '@/components/ProductCard'
import CartFloating from '@/components/CartFloating'

async function getProduct(slug) {
  const { data } = await supabase
    .from('products')
    .select('*, product_images(id,image_url,alt_text,is_primary,sort_order), product_variants(*), categories(id,name,slug)')
    .eq('slug', slug).eq('is_active', true).single()
  return data
}

async function getRelated(categoryId, productId) {
  if (!categoryId) return []
  const { data } = await supabase
    .from('products')
    .select('*, product_images(image_url,is_primary)')
    .eq('is_active', true).eq('category_id', categoryId).neq('id', productId).limit(4)
  return data ?? []
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const related = await getRelated(product.category_id, product.id)
  const images  = [...(product.product_images ?? [])].sort((a, b) =>
    (a.is_primary ? -1 : 1) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const variantGroups = product.product_variants?.reduce((acc, v) => {
    if (!acc[v.variant_name]) acc[v.variant_name] = []
    acc[v.variant_name].push(v)
    return acc
  }, {}) ?? {}

  return (
    <div className="min-h-screen bg-surface">
      <div className="page-container py-8 pb-28">
        <div className="bg-white rounded-xl3 shadow-card p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProductDetailClient product={product} images={images} variantGroups={variantGroups} />
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="section-title mb-5">Produk Serupa</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
      <CartFloating />
    </div>
  )
}
