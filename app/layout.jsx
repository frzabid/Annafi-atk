import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: { default: 'Annafi Print', template: '%s — Annafi Print' },
  description: 'Toko print, fotokopi, ATK, dan kebutuhan sehari-hari.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}
