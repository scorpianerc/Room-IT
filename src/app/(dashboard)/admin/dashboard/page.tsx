// src/app/(dashboard)/admin/dashboard/page.tsx (update existing file)
'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, CheckCircle, Clock, Bell, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  totalBookings: number
  pendingBookings: number
  approvedBookings: number
}

interface RecentBooking {
  id: string
  title: string
  user: {
    name: string
    email: string
  }
  room: {
    name: string
    building: {
      name: string
    }
  }
  startTime: string
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentBookings()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchRecentBookings = async () => {
    try {
      const response = await fetch('/api/admin/recent-bookings')
      if (response.ok) {
        const data = await response.json()
        setRecentBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch recent bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatBookingDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500'
      case 'PENDING':
        return 'bg-yellow-500'
      case 'REJECTED':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Disetujui'
      case 'PENDING':
        return 'Menunggu'
      case 'REJECTED':
        return 'Ditolak'
      default:
        return status
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-300">Kelola peminjaman ruangan Fakultas Ilmu Komputer</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
              <p className="text-gray-600 text-sm">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.totalBookings}</p>
              <p className="text-gray-600 text-sm">Total Booking</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.pendingBookings}</p>
              <p className="text-gray-600 text-sm">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.approvedBookings}</p>
              <p className="text-gray-600 text-sm">Approved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                Booking Terbaru
              </h3>
              <Link 
                href="/admin/bookings"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Lihat Semua
              </Link>
            </div>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Memuat...</p>
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada booking baru</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{booking.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{booking.user.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{booking.room.name} - {formatBookingDate(booking.startTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Diajukan: {formatDate(booking.createdAt)}</span>
                      </div>
                    </div>

                    {booking.status === 'PENDING' && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <Link
                          href={`/admin/bookings`}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Perlu Review
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              <Link 
                href="/admin/bookings"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">Review Booking</h4>
                    <p className="text-sm text-gray-600">
                      {stats.pendingBookings} booking menunggu persetujuan
                    </p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/admin/rooms"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">Kelola Ruangan</h4>
                    <p className="text-sm text-gray-600">Tambah, edit, dan hapus ruangan</p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/admin/users"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">Kelola Users</h4>
                    <p className="text-sm text-gray-600">Atur akun user dan role</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Bookings Alert */}
      {stats.pendingBookings > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800">
                Ada {stats.pendingBookings} booking yang perlu direview
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Silakan review dan berikan persetujuan untuk permintaan peminjaman ruangan.
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Review Sekarang
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}