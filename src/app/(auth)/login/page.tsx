// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email atau password salah')
      } else if (result?.ok) {
        // Successful login - let NextAuth handle the redirect
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Login error:', error)
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
            <div className="bg-blue-600 p-16 flex items-center justify-center">
              <div className="text-center">
                <div className="w-48 h-10 relative mb-8 mx-auto">
                  <Image
                    src="/images/roomit.svg"
                    alt="Room IT Logo"
                    width={200}
                    height={200}
                    className="object-contain mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Login Form - bagian bawah untuk mobile */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-2 text-black">
                Selamat Datang di Room IT
              </h2>
              <p className="text-black text-center mb-6 text-sm">
                Web untuk peminjaman ruangan di lingkungan Fakultas Ilmu Komputer.
              </p>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Masuk...' : 'Login'}
                </button>
                <Link 
                  href="/register"
                  className="w-full border border-blue-600 text-blue-600 p-3 rounded-lg font-semibold text-center block hover:bg-blue-50 transition-colors"
                >
                  Register
                </Link>
              </form>

              {/* Quick Demo Login */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-black text-center mb-3">Demo Login:</p>
                <div className="text-xs text-black space-y-1">
                  <div className="text-center">
                    <p><strong className="text-black">Admin:</strong> <span className="text-black">admin@filkom.ub.ac.id / admin123</span></p>
                    <p><strong className="text-black">Student:</strong> <span className="text-black">bambang@student.ub.ac.id / student123</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Logo di samping */}
          <div className="hidden md:flex">
            {/* Logo Section - bagian kiri untuk desktop */}
            <div className="bg-blue-600 p-16 flex items-center justify-center w-1/3">
              <div className="text-center">
                <div className="w-56 h-10 relative mb-10 mx-auto">
                  <Image
                    src="/images/roomit.svg"
                    alt="Room IT Logo"
                    width={224}
                    height={224}
                    className="object-contain mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Login Form - bagian kanan untuk desktop */}
            <div className="p-8 w-2/3">
              <h2 className="text-3xl font-bold text-center mb-4 text-black">
                Selamat Datang di Room IT
              </h2>
              <p className="text-black text-center mb-8 text-base">
                Web untuk peminjaman ruangan di lingkungan Fakultas Ilmu Komputer.
              </p>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg"
                >
                  {loading ? 'Masuk...' : 'Login'}
                </button>
                <Link 
                  href="/register"
                  className="w-full border border-blue-600 text-blue-600 p-4 rounded-lg font-semibold text-center block hover:bg-blue-50 transition-colors text-lg"
                >
                  Register
                </Link>
              </form>

              {/* Quick Demo Login */}
              <div className="mt-6 pt-6 border-t max-w-md mx-auto">
                <p className="text-sm text-black text-center mb-3">Demo Login:</p>
                <div className="text-xs text-black space-y-1">
                  <div className="text-center">
                    <p><strong className="text-black">Admin:</strong> <span className="text-black">admin@filkom.ub.ac.id / admin123</span></p>
                    <p><strong className="text-black">Student:</strong> <span className="text-black">bambang@student.ub.ac.id / student123</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}