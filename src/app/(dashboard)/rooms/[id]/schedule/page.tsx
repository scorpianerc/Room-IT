// src/app/(dashboard)/rooms/[id]/schedule/page.tsx
'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Clock, Users, ArrowLeft, Plus, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Room {
  id: string
  name: string
  capacity: number
  facilities: string
  image: string | null
  building: {
    id: string
    name: string
    code: string
  }
}

interface Booking {
  id: string
  title: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  user: {
    name: string
  }
  isPublic: boolean
}

export default function RoomSchedulePage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  
  const [room, setRoom] = useState<Room | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [roomLoading, setRoomLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedStartTime, setSelectedStartTime] = useState('08:00')
  const [selectedEndTime, setSelectedEndTime] = useState('10:00')
  const [error, setError] = useState('')

  // Memoize time options untuk performa
  const timeOptions = useMemo(() => {
    const times = []
    for (let hour = 7; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push(timeString)
      }
    }
    return times
  }, [])

  // Fetch room details (hanya sekali)
  useEffect(() => {
    if (roomId) {
      fetchRoomDetails()
    }
  }, [roomId])

  // Fetch bookings saat tanggal berubah
  useEffect(() => {
    if (roomId && selectedDate) {
      fetchBookings()
    }
  }, [roomId, selectedDate])

  // Handle URL parameters saat pertama load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const dateParam = urlParams.get('date')
    const startTimeParam = urlParams.get('startTime')
    const endTimeParam = urlParams.get('endTime')

    if (dateParam) setSelectedDate(dateParam)
    if (startTimeParam) setSelectedStartTime(startTimeParam)
    if (endTimeParam) setSelectedEndTime(endTimeParam)
  }, [])

  const fetchRoomDetails = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setRoom(data)
      } else {
        setError('Room not found')
      }
    } catch (error) {
      console.error('Failed to fetch room details:', error)
      setError('Failed to load room details')
    } finally {
      setRoomLoading(false)
    }
  }

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/rooms/${roomId}/bookings?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        setError('Failed to load bookings')
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      setError('Network error occurred')
    } finally {
      setBookingsLoading(false)
    }
  }, [roomId, selectedDate])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  const isTimeSlotAvailable = useMemo(() => {
    const selectedStart = new Date(`${selectedDate}T${selectedStartTime}:00`)
    const selectedEnd = new Date(`${selectedDate}T${selectedEndTime}:00`)

    return !bookings.some(booking => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      
      return (
        booking.status !== 'REJECTED' &&
        ((selectedStart >= bookingStart && selectedStart < bookingEnd) ||
         (selectedEnd > bookingStart && selectedEnd <= bookingEnd) ||
         (selectedStart <= bookingStart && selectedEnd >= bookingEnd))
      )
    })
  }, [bookings, selectedDate, selectedStartTime, selectedEndTime])

  // Loading state untuk room details
  if (roomLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-gray-800 rounded-full mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Jadwal Ruangan</h1>
        </div>
        
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat informasi ruangan...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !room) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-gray-800 rounded-full mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Jadwal Ruangan</h1>
        </div>
        
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold mb-2">Error</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-white hover:bg-gray-800 rounded-full mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Jadwal Ruangan</h1>
      </div>

      {/* Room Info */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex space-x-4">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            {room?.image ? (
              <Image
                src={room.image}
                alt={room.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center ${room?.image ? 'hidden' : ''}`}>
              <span className="text-white text-xs font-bold">ROOM</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-black mb-2">{room?.name}</h2>
            <div className="flex items-center text-gray-600 mb-1">
              <Users className="w-4 h-4 mr-2" />
              <span>Kapasitas: {room?.capacity} orang</span>
            </div>
            <div className="flex items-center text-gray-600 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Gedung: {room?.building.name}</span>
            </div>
            {room?.facilities && (
              <p className="text-gray-600 text-sm">
                Fasilitas: {room.facilities}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-black mb-4">Pilih Waktu Peminjaman</h3>
        
        {/* Date Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            Tanggal:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
          />
        </div>

        {/* Time Pickers */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Jam Mulai:
            </label>
            <select
              value={selectedStartTime}
              onChange={(e) => setSelectedStartTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
            >
              {timeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Jam Selesai:
            </label>
            <select
              value={selectedEndTime}
              onChange={(e) => setSelectedEndTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
            >
              {timeOptions.filter(time => time > selectedStartTime).map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Availability Check */}
        <div className="mb-4">
          {bookingsLoading ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gray-500" />
                <p className="text-gray-600 text-sm">Mengecek ketersediaan...</p>
              </div>
            </div>
          ) : isTimeSlotAvailable ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">Waktu tersedia untuk dipesan</p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">Waktu tidak tersedia, silakan pilih waktu lain</p>
            </div>
          )}
        </div>

        {/* Book Room Button */}
        <Link
          href={`/booking/create?roomId=${roomId}&date=${selectedDate}&startTime=${selectedStartTime}&endTime=${selectedEndTime}`}
          className={`w-full text-white p-4 rounded-lg font-semibold text-center block transition-colors flex items-center justify-center ${
            isTimeSlotAvailable && !bookingsLoading
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed pointer-events-none'
          }`}
        >
          <Plus className="w-5 h-5 mr-2" />
          Pesan Ruangan Ini
        </Link>
      </div>

      {/* Schedule List */}
      <div className="bg-white rounded-lg">
        <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h3 className="font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Jadwal Peminjaman
          </h3>
          {bookingsLoading && (
            <RefreshCw className="w-4 h-4 animate-spin" />
          )}
        </div>
        
        <div className="p-4">
          {bookingsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat jadwal...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchBookings}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada peminjaman pada tanggal ini</p>
              <p className="text-sm text-gray-400">Ruangan tersedia untuk dipesan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-black">{booking.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)} WIB
                    </span>
                  </div>
                  {booking.isPublic && (
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Peminjam: {booking.user.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Tips:</h4>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• Pastikan waktu yang dipilih tidak bertabrakan dengan jadwal yang ada</li>
          <li>• Peminjaman harus disetujui admin terlebih dahulu</li>
          <li>• Siapkan proposal kegiatan sebelum melakukan peminjaman</li>
          <li>• Minimal peminjaman 1 jam, maksimal 8 jam per hari</li>
        </ul>
      </div>
    </div>
  )
}