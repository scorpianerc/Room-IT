// src/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (response.ok) {
        router.push('/login?message=Registration successful')
      } else {
        const data = await response.json()
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Container untuk logo dan form */}
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Mobile Layout - Logo di atas */}
          <div className="block md:hidden">
            {/* Logo Section - bagian atas untuk mobile */}
            <div className="bg-blue-600 p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center justify-center mb-4">
                    <Image src="/images/roomit.svg" alt="Logo" width={300} height={300} className="mr-3" />
                  </div>
              </div>
            </div>

            {/* Register Form - bagian bawah untuk mobile */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-2 text-black">
                Daftar Akun Baru
              </h2>
              <p className="text-black text-center mb-6 text-sm">
                Buat akun untuk mulai memesan ruangan di Fakultas Ilmu Komputer
              </p>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nama Lengkap"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-black placeholder-gray-600"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-black placeholder-gray-600"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-black placeholder-gray-600"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Konfirmasi Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-black placeholder-gray-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Mendaftar...' : 'Daftar'}
                </button>
                <Link 
                  href="/login"
                  className="w-full border border-blue-600 text-blue-600 p-3 rounded-lg font-semibold text-center block hover:bg-blue-50 transition-colors"
                >
                  Sudah punya akun? Login
                </Link>
              </form>
            </div>
          </div>

          {/* Desktop Layout - Logo di samping */}
          <div className="hidden md:flex">
            {/* Logo Section - bagian kiri untuk desktop */}
            <div className="bg-blue-600 p-8 flex items-center justify-center w-1/3">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center justify-center mb-4">
                    <Image src="/images/roomit.svg" alt="Logo" width={800} height={800} className="mr-3" />
                    </div>
                </div>
              </div>
            </div>

            {/* Register Form - bagian kanan untuk desktop */}
            <div className="p-8 w-2/3">
              <h2 className="text-3xl font-bold text-center mb-4 text-black">
                Daftar Akun Baru
              </h2>
              <p className="text-black text-center mb-8 text-base">
                Buat akun untuk mulai memesan ruangan di Fakultas Ilmu Komputer
              </p>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nama Lengkap"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-black placeholder-gray-600 text-lg"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-black placeholder-gray-600 text-lg"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-black placeholder-gray-600 text-lg"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Konfirmasi Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-black placeholder-gray-600 text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg"
                >
                  {loading ? 'Mendaftar...' : 'Daftar'}
                </button>
                <Link 
                  href="/login"
                  className="w-full border border-blue-600 text-blue-600 p-4 rounded-lg font-semibold text-center block hover:bg-blue-50 transition-colors text-lg"
                >
                  Sudah punya akun? Login
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}