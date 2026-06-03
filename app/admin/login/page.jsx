'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Password salah. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg,#0A3D62,#1565C0)' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🖨️</div>
          <h1 className="text-2xl font-bold text-dark">Admin Panel</h1>
          <p className="text-muted text-sm mt-1">Annafi Print</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Password Admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full border-2 border-border px-4 py-3 rounded-xl text-sm outline-none focus:border-ocean transition-colors"
              required
            />
          </div>
          {error && (
            <p className="text-coral text-sm font-medium">⚠️ {error}</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-ocean text-white font-bold py-3 rounded-xl hover:bg-navy transition-colors disabled:opacity-60">
            {loading ? 'Masuk...' : '🔐 Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
