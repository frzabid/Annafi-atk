import Link from 'next/link'

const KATEGORI = [
  { icon: '🖨️', label: 'Print & Fotokopi', slug: 'print-fotokopi', color: 'bg-sea-light hover:bg-sea-mid' },
  { icon: '✏️', label: 'ATK',              slug: 'atk',            color: 'bg-gold/20 hover:bg-gold/30' },
  { icon: '🎁', label: 'Aksesoris',        slug: 'aksesoris',      color: 'bg-purple/10 hover:bg-purple/20' },
  { icon: '🧸', label: 'Mainan',           slug: 'mainan',         color: 'bg-green/10 hover:bg-green/20' },
  { icon: '🛒', label: 'Sembako',          slug: 'sembako',        color: 'bg-coral/10 hover:bg-coral/20' },
  { icon: '🎂', label: 'Ulang Tahun',      slug: 'ulang-tahun',    color: 'bg-gold/20 hover:bg-gold/30' },
  { icon: '📦', label: 'Lainnya',          slug: 'lainnya',        color: 'bg-surface hover:bg-border' },
  { icon: '🔍', label: 'Semua Produk',     slug: '',               color: 'bg-ocean/10 hover:bg-ocean/20' },
]

export default function HomePage() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Annafi Print'
  const waNumber  = process.env.NEXT_PUBLIC_WA_NUMBER  || ''

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0A3D62 0%, #1565C0 50%, #1E88E5 100%)' }}>

        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-gold/10 blur-2xl" />
        <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-sea/20 blur-2xl" />

        {/* Floating icons */}
        <div className="absolute left-8 top-1/4 text-6xl opacity-20 select-none rotate-12 hidden md:block">🖨️</div>
        <div className="absolute left-16 bottom-1/3 text-5xl opacity-15 select-none hidden md:block">✏️</div>
        <div className="absolute right-10 top-1/3 text-6xl opacity-20 select-none hidden md:block">🖨️</div>
        <div className="absolute right-20 bottom-1/4 text-4xl opacity-15 select-none hidden md:block">🎈</div>
        <div className="absolute top-1/4 right-1/3 text-3xl opacity-10 select-none hidden md:block">🪁</div>

        {/* Center content */}
        <div className="relative page-container w-full text-center pt-20">
          <div className="max-w-2xl mx-auto">
            <div className="fade-up stagger-1 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-white/20">
              <span>🖨️</span> {storeName}
            </div>

            {/* ── MOTTO — ganti teks di bawah ini ── */}
            <h1 className="fade-up stagger-2 text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
              Cetak Impianmu,<br />
              <span className="text-gold">Kami Siap Membantu!</span>
            </h1>

        
            <div className="fade-up stagger-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/katalog" className="btn-gold text-base px-8 py-4 text-dark font-bold rounded-xl shadow-btn">
                🛒 Belanja Sekarang
              </Link>
              <Link href={`https://wa.me/${waNumber}`} target="_blank"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white font-semibold text-base px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
                💬 Hubungi Kami
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40 C360 80 1080 0 1440 40 L1440 80 L0 80 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── KATEGORI ── */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">Kategori Produk</h2>
            <p className="text-muted">Temukan semua yang kamu butuhkan</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {KATEGORI.map((cat) => (
              <Link key={cat.slug} href={`/katalog${cat.slug ? `?category=${cat.slug}` : ''}`}
                className={`${cat.color} rounded-xl2 p-5 flex flex-col items-center gap-2 transition-all duration-200 hover:-translate-y-1 group`}>
                <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-semibold text-dark text-center">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARA BELANJA ── */}
      <section className="py-16 bg-surface">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">Cara Belanja</h2>
            <p className="text-muted">Mudah, cepat, langsung ke WhatsApp</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step:'1', icon:'📦', title:'Pilih Produk',     desc:'Jelajahi katalog dan pilih produk yang kamu butuhkan' },
              { step:'2', icon:'🛒', title:'Tambah Keranjang', desc:'Masukkan produk ke keranjang dengan jumlah yang diinginkan' },
              { step:'3', icon:'📋', title:'Isi Data',          desc:'Isi nama, alamat, dan metode pembayaran kamu' },
              { step:'4', icon:'💬', title:'Pesan via WA',      desc:'Klik tombol dan pesananmu langsung terkirim ke WhatsApp kami' },
            ].map((s) => (
              <div key={s.step} className="card p-6 text-center">
                <div className="w-10 h-10 bg-ocean text-white font-bold text-sm rounded-full flex items-center justify-center mx-auto mb-3">{s.step}</div>
                <span className="text-3xl block mb-2">{s.icon}</span>
                <h3 className="font-bold text-dark mb-1">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TENTANG KAMI ── */}
      <section id="tentang" className="py-16 bg-white">
        <div className="page-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="section-title mb-2">Tentang Kami</h2>
              <p className="text-muted">Kenali kami lebih dekat</p>
            </div>
            <div className="card p-8">
              {/* ── DESKRIPSI TOKO — ganti teks ini ── */}
              <p className="text-muted text-center leading-relaxed mb-8 italic">
                ✏️ Ganti teks ini dengan deskripsi singkat tentang toko kamu — apa yang dijual, keunggulan, dan kenapa pelanggan harus memilih kamu.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon:'📱', label:'WhatsApp',  value:'62XXXXXXXXXX',           href:`https://wa.me/${waNumber}`,                  color:'bg-green/10 text-green' },
                  { icon:'📸', label:'Instagram', value:'@nama_instagram',         href:'https://instagram.com/nama_instagram',        color:'bg-purple/10 text-purple' },
                  { icon:'👍', label:'Facebook',  value:'Nama Facebook',           href:'https://facebook.com',                        color:'bg-ocean/10 text-ocean' },
                  { icon:'📍', label:'Alamat',    value:'Isi alamat toko di sini', href:null,                                          color:'bg-coral/10 text-coral' },
                  { icon:'🕐', label:'Jam Buka',  value:'Senin–Sabtu: 06.00–21.00, Minggu: 07.00-21.00',href:null,                                          color:'bg-gold/20 text-dark' },
                ].map((item) => (
                  <div key={item.label} className={`${item.color} rounded-xl p-4`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                    </div>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:underline">{item.value}</a>
                    ) : (
                      <p className="text-sm font-semibold">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'linear-gradient(135deg, #0A3D62, #1565C0)' }} className="text-white py-10">
        <div className="page-container text-center">
          <div className="text-3xl mb-3">🖨️</div>
          <p className="font-bold text-xl mb-1">{storeName}</p>
          <p className="text-white/50 text-sm">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
