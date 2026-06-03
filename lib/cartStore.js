'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, variant = null, quantity = 1) => {
        const key = variant ? `${product.id}-${variant.id}` : product.id
        const existing = get().items.find((i) => i.key === key)
        const price = product.price + (variant?.price_diff ?? 0)
        if (existing) {
          set((s) => ({ items: s.items.map((i) => i.key === key ? { ...i, quantity: i.quantity + quantity } : i) }))
        } else {
          set((s) => ({ items: [...s.items, {
            key, productId: product.id, productName: product.name,
            slug: product.slug, image: product.product_images?.[0]?.image_url ?? null,
            variantId: variant?.id ?? null,
            variantInfo: variant ? `${variant.variant_name}: ${variant.variant_value}` : null,
            price, quantity,
          }] }))
        }
      },
      removeItem: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      updateQty: (key, qty) => {
        if (qty < 1) { get().removeItem(key); return }
        set((s) => ({ items: s.items.map((i) => i.key === key ? { ...i, quantity: qty } : i) }))
      },
      clearCart: () => set({ items: [] }),
      get totalItems() { return get().items.reduce((s, i) => s + i.quantity, 0) },
      get subtotal()   { return get().items.reduce((s, i) => s + i.price * i.quantity, 0) },
    }),
    { name: 'annafi-cart' }
  )
)
export default useCartStore
