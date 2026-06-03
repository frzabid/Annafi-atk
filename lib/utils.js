export const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

export const formatWAMessage = (items, customer, subtotal) => {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Toko'
  const lines = items.map(
    (i) => `• ${i.productName}${i.variantInfo ? ` (${i.variantInfo})` : ''} x${i.quantity} = ${formatRupiah(i.price * i.quantity)}`
  )
  return encodeURIComponent(
    `Halo ${storeName}! Saya ingin memesan:\n\n` +
    lines.join('\n') +
    `\n\n*Subtotal: ${formatRupiah(subtotal)}*` +
    `\n\n---\n*Data Penerima:*` +
    `\nNama: ${customer.name}` +
    `\nNo. Telepon: ${customer.phone}` +
    `\nAlamat: ${customer.address}` +
    `\nMetode Pembayaran: ${customer.payment}` +
    (customer.notes ? `\nCatatan: ${customer.notes}` : '') +
    `\n\nMohon konfirmasi ketersediaan & ongkos kirim. Terima kasih! 🙏`
  )
}
