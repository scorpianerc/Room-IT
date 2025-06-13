// src/app/(dashboard)/status/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, Users, FileText, Phone, User } from 'lucide-react'
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
  createdAt: string
}

export default function StatusPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings/my-bookings')
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
        return 'Menunggu Persetujuan'
      case 'REJECTED':
        return 'Ditolak'
      default:
        return status
    }
  }

  const filteredBookings = bookings.filter(booking => 
    filter === 'ALL' || booking.status === filter
  )

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center">Memuat status peminjaman...</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Status Peminjaman</h1>
        <p className="text-gray-300">Pantau status permintaan peminjaman ruangan Anda</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED')}
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

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {filter === 'ALL' 
                ? 'Belum ada peminjaman ruangan' 
                : `Tidak ada peminjaman dengan status ${getStatusText(filter)}`
              }
            </p>
            <p className="text-sm text-gray-400">
              Mulai pesan ruangan untuk kegiatan Anda
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                {/* Header with Status */}
                <div className="flex justify-between items-start p-4 border-b">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-semibold text-lg text-black truncate mb-1">
                      {booking.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Diajukan: {formatDate(booking.createdAt)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs text-white font-bold flex-shrink-0 ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>

                {/* Room Image */}
                <div className="px-4 pt-4">
                  <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
                    {booking.room.image ? (
                      <Image
                        src={booking.room.image}
                        alt={booking.room.name}
                        width={400}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">ROOM</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="px-4 pb-4">
                  {/* Description */}
                  {booking.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {booking.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Info Grid */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{booking.room.name} - {booking.room.building.name}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{formatDate(booking.startTime)}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{formatTime(booking.startTime, booking.endTime)}</span>
                    </div>

                    {booking.participantCount && (
                      <div className="flex items-start">
                        <Users className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{booking.participantCount} peserta</span>
                      </div>
                    )}

                    {booking.coordinatorName && (
                      <div className="flex items-start">
                        <User className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="break-words">Koordinator: {booking.coordinatorName}</span>
                      </div>
                    )}

                    {booking.phoneNumber && (
                      <div className="flex items-start">
                        <Phone className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="break-words">{booking.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Proposal Link */}
                  {booking.proposalUrl && (
                    <div className="border-t pt-3">
                      <a
                        href={booking.proposalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 text-sm hover:text-blue-700"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Lihat Proposal
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                {/* Header with "Diajukan" di pojok kanan */}
                <div className="flex justify-end items-start p-4 pb-2">
                  <span className="text-xs text-gray-500">
                    Diajukan: {formatDate(booking.createdAt)}
                  </span>
                </div>

                <div className="flex px-4 pb-4">
                  {/* Room Image */}
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden mr-4">
                    {booking.room.image ? (
                      <Image
                        src={booking.room.image}
                        alt={booking.room.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">ROOM</span>
                      </div>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-black pr-4">{booking.title}</h3>
                      <span className={`px-4 py-2 rounded-full text-xs text-white font-bold flex-shrink-0 ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    {booking.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {booking.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{booking.room.name} - {booking.room.building.name}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{formatDate(booking.startTime)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{formatTime(booking.startTime, booking.endTime)}</span>
                      </div>

                      {booking.participantCount && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{booking.participantCount} peserta</span>
                        </div>
                      )}

                      {booking.coordinatorName && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Koordinator: {booking.coordinatorName}</span>
                        </div>
                      )}

                      {booking.phoneNumber && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{booking.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Link File Proposal */}
                    {booking.proposalUrl && (
                      <div>
                        <a
                          href={booking.proposalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 text-sm hover:text-blue-700"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Lihat Proposal
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Informasi Status:</h3>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• <strong>Menunggu Persetujuan:</strong> Permintaan sedang direview admin</li>
          <li>• <strong>Disetujui:</strong> Peminjaman telah disetujui, ruangan dapat digunakan</li>
          <li>• <strong>Ditolak:</strong> Permintaan ditolak, silakan ajukan ulang dengan perbaikan</li>
        </ul>
      </div>
    </div>
  )
}