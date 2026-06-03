'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatRupiah, formatWAMessage } from '@/lib/utils'
import useCartStore from '@/lib/cartStore'

const PAYMENT = [
  { value: 'Cash',          label: 'Cash',         icon: '💵', desc: 'Bayar tunai saat ambil/terima' },
  { value: 'QRIS',          label: 'QRIS',         icon: '📱', desc: 'Scan QR dari semua e-wallet' },
  { value: 'Transfer Bank', label: 'Transfer Bank', icon: '🏦', desc: 'Transfer via ATM / m-banking' },
]

// ✅ Field di luar komponen — supaya tidak re-mount saat ketik
function Field({ form, setForm, errors, name, label, required, textarea, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-dark mb-1.5">
        {label}{required && <span className="text-coral ml-1">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={form[name]}
          onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
          rows={3}
          placeholder={placeholder}
          className={`w-full border-2 px-4 py-3 rounded-xl text-sm outline-none resize-none transition-colors ${
            errors[name] ? 'border-coral' : 'border-border focus:border-ocean'
          }`}
        />
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
          placeholder={placeholder}
          className={`w-full border-2 px-4 py-3 rounded-xl text-sm outline-none transition-colors ${
            errors[name] ? 'border-coral' : 'border-border focus:border-ocean'
          }`}
        />
      )}
      {errors[name] && <p className="text-coral text-xs mt-1">⚠️ {errors[name]}</p>}
    </div>
  )
}

export default function KeranjangPage() {
  const { items, removeItem, updateQty, clearCart } = useCartStore()
  const [form,   setForm]   = useState({ name: '', phone: '', address: '', payment: '', notes: '' })
  const [errors, setErrors] = useState({})

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Nama wajib diisi'
    if (!form.phone.trim())   e.phone   = 'Nomor telepon wajib diisi'
    if (!form.address.trim()) e.address = 'Alamat wajib diisi'
    if (!form.payment)        e.payment = 'Pilih metode pembayaran'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCheckout = () => {
    if (!validate()) return
    const msg = formatWAMessage(items, form, subtotal)
    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank')
  }

  /* ── EMPTY STATE ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center py-20 px-6">
          <span className="text-8xl block mb-6">🛒</span>
          <h2 className="text-2xl font-bold text-dark mb-2">Keranjang Masih Kosong</h2>
          <p className="text-muted mb-2">Kamu belum memilih produk apapun.</p>
          <p className="text-muted mb-8">Silahkan pilih barang di menu Produk terlebih dahulu!</p>
          <Link href="/katalog" className="btn-primary text-base px-8 py-4">
            📦 Lihat Produk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-navy">
        <div className="page-container py-6">
          <h1 className="text-2xl font-bold text-white">🛒 Keranjang Belanja</h1>
          <p className="text-sea text-sm mt-1">{items.length} produk dipilih</p>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: Items + Form ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Cart items */}
            <div className="bg-white rounded-xl2 shadow-card p-5">
              <h2 className="font-bold text-dark mb-4">Produk yang Dipilih</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-3 p-3 bg-surface rounded-xl">
                    {/* Image */}
                    <div className="relative w-16 h-16 shrink-0 bg-border rounded-lg overflow-hidden">
                      {item.image ? (
                        <Image src={item.image} alt={item.productName} fill sizes="64px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-dark line-clamp-1">{item.productName}</p>
                      {item.variantInfo && <p className="text-xs text-muted mt-0.5">{item.variantInfo}</p>}
                      <p className="text-ocean font-bold text-sm mt-1">{formatRupiah(item.price)}</p>
                      <div className="flex items-center justify-between mt-2">
                        {/* Qty */}
                        <div className="flex items-center border-2 border-border rounded-lg overflow-hidden">
                          <button onClick={() => updateQty(item.key, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-border font-bold text-sm transition-colors">−</button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.key, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-border font-bold text-sm transition-colors">+</button>
                        </div>
                        <button onClick={() => removeItem(item.key)}
                          className="text-xs text-coral hover:underline transition-colors">Hapus</button>
                      </div>
                    </div>
                    {/* Subtotal */}
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-dark">{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={clearCart}
                className="mt-3 text-xs text-muted hover:text-coral transition-colors">
                🗑️ Kosongkan keranjang
              </button>
            </div>

            {/* Customer form */}
            <div className="bg-white rounded-xl2 shadow-card p-5 space-y-4">
              <h2 className="font-bold text-dark">Data Penerima</h2>
              <Field
                form={form} setForm={setForm} errors={errors}
                name="name" label="Nama Penerima" required
                placeholder="Masukkan nama lengkap"
              />
              <Field
                form={form} setForm={setForm} errors={errors}
                name="phone" label="Nomor Telepon" required type="tel"
                placeholder="Contoh: 08123456789"
              />
              <Field
                form={form} setForm={setForm} errors={errors}
                name="address" label="Alamat Lengkap" required textarea
                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota"
              />
              <Field
                form={form} setForm={setForm} errors={errors}
                name="notes" label="Catatan Pesanan" textarea
                placeholder="Catatan tambahan (opsional)"
              />
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-xl2 shadow-card p-5">
              <h2 className="font-bold text-dark mb-3">
                Metode Pembayaran <span className="text-coral">*</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PAYMENT.map((pm) => (
                  <button key={pm.value}
                    onClick={() => { setForm((f) => ({ ...f, payment: pm.value })); setErrors((e) => ({ ...e, payment: '' })) }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.payment === pm.value
                        ? 'border-ocean bg-sea-light'
                        : 'border-border hover:border-sea'
                    }`}>
                    <span className="text-2xl block mb-1">{pm.icon}</span>
                    <p className="font-bold text-sm text-dark">{pm.label}</p>
                    <p className="text-xs text-muted mt-0.5">{pm.desc}</p>
                  </button>
                ))}
              </div>
              {errors.payment && (
                <p className="text-coral text-xs mt-2">⚠️ {errors.payment}</p>
              )}
            </div>
          </div>

          {/* ── RIGHT: Summary ── */}
          <div>
            <div className="bg-white rounded-xl2 shadow-card p-5 sticky top-20">
              <h2 className="font-bold text-dark mb-4">Ringkasan Pesanan</h2>

              {/* Item list */}
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.key} className="flex justify-between text-sm">
                    <span className="text-muted line-clamp-1 flex-1 mr-2">
                      {item.productName} ×{item.quantity}
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-border pt-3 mb-5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Subtotal</span>
                  <span className="font-bold text-ocean">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Ongkos Kirim</span>
                  <span className="text-xs text-muted italic">Konfirmasi via WA</span>
                </div>
                {form.payment && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Pembayaran</span>
                    <span className="text-sm font-semibold text-dark">{form.payment}</span>
                  </div>
                )}
              </div>

              <button onClick={handleCheckout}
                className="w-full bg-green text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-95 transition-all hover:shadow-md hover:-translate-y-0.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Pesan via WhatsApp
              </button>

              <p className="text-xs text-muted text-center mt-3 leading-relaxed">
                Kamu akan diarahkan ke WhatsApp untuk konfirmasi pesanan, pembayaran & pengiriman.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}