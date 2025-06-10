// src/app/(dashboard)/admin/bookings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, Users, FileText, Phone, User, Check, X, Eye, Filter } from 'lucide-react'
import Image from 'next/image'

interface Booking {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  participantCount?: number
  coordinatorName?: string
  phoneNumber?: string
  proposalUrl?: string
  room: {
    name: string
    image: string | null
    building: {
      name: string
    }
  }
  user: {
    name: string
    email: string
  }
  createdAt: string
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingIds(prev => new Set(prev).add(bookingId))
    
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        ))
        alert(`Booking berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`)
      } else {
        alert('Gagal mengubah status booking')
      }
    } catch (error) {
      console.error('Failed to update booking status:', error)
      alert('Terjadi kesalahan')
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(bookingId)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
    const end = new Date(endTime).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
    return `${start} - ${end} WIB`
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

  const filteredBookings = bookings.filter(booking => 
    filter === 'ALL' || booking.status === filter
  )

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    rejected: bookings.filter(b => b.status === 'REJECTED').length,
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center">Memuat data booking...</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Kelola Booking</h1>
        <p className="text-gray-300">Kelola dan review semua permintaan peminjaman ruangan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-gray-600 text-sm">Total Booking</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              <p className="text-gray-600 text-sm">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <Check className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
              <p className="text-gray-600 text-sm">Disetujui</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <X className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.rejected}</p>
              <p className="text-gray-600 text-sm">Ditolak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'Semua' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada booking ditemukan</p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const isProcessing = processingIds.has(booking.id)
            
            return (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-black mb-1">{booking.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{booking.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        <span>{booking.user.name} ({booking.user.email})</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs text-white font-bold ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{booking.room.name} - {booking.room.building.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(booking.startTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatTime(booking.startTime, booking.endTime)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      {booking.participantCount && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{booking.participantCount} peserta</span>
                        </div>
                      )}
                      {booking.coordinatorName && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>Koordinator: {booking.coordinatorName}</span>
                        </div>
                      )}
                      {booking.phoneNumber && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{booking.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      {booking.proposalUrl && (
                        <a
                          href={booking.proposalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Lihat Proposal
                        </a>
                      )}
                    </div>

                    {booking.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'REJECTED')}
                          disabled={isProcessing}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Tolak
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'APPROVED')}
                          disabled={isProcessing}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Setujui
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}