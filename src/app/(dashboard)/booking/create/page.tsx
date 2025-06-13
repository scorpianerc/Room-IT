// src/app/(dashboard)/booking/create/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Calendar, Clock, Users, MapPin, Edit } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Room {
  id: string
  name: string
  capacity: number
  facilities: string
  image: string | null
  building: {
    name: string
  }
}

export default function CreateBookingPage() {
  const router = useRouter()
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showTimeEditor, setShowTimeEditor] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    roomId: searchParams.get('roomId') || '',
    date: searchParams.get('date') || '',
    startTime: searchParams.get('startTime') || '08:00',
    endTime: searchParams.get('endTime') || '10:00',
    title: '',
    description: '',
    participantCount: '',
    coordinatorName: '',
    phoneNumber: '',
  })

  const fetchRoomDetails = useCallback(async () => {
    if (!formData.roomId) return
    
    try {
      const response = await fetch(`/api/rooms/${formData.roomId}`)
      if (response.ok) {
        const data = await response.json()
        setRoom(data)
      }
    } catch (error) {
      console.error('Failed to fetch room details:', error)
    }
  }, [formData.roomId])

  useEffect(() => {
    fetchRoomDetails()
  }, [fetchRoomDetails])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) { // 10MB limit
        setUploadedFile(file)
      } else {
        alert('File harus berformat PDF dan maksimal 10MB')
      }
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    const fileInput = document.getElementById('proposal') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const generateTimeOptions = () => {
    const times = []
    for (let hour = 7; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push(timeString)
      }
    }
    return times
  }

  const handleTimeChange = () => {
    // Redirect back to schedule page with new time parameters
    const params = new URLSearchParams({
      roomId: formData.roomId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
    })
    
    router.push(`/rooms/${formData.roomId}/schedule?${params.toString()}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadedFile) {
      alert('Silakan upload proposal terlebih dahulu')
      return
    }

    setLoading(true)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('proposal', uploadedFile)
      
      // Add other form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value)
      })

      const response = await fetch('/api/bookings', {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()

      if (response.ok) {
        router.push('/booking/success')
      } else {
        alert(result.error || 'Terjadi kesalahan saat mengirim permintaan')
        console.error('Booking error:', result)
      }
    } catch (error) {
      console.error('Failed to submit booking:', error)
      alert('Terjadi kesalahan jaringan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (!room) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center">Memuat data ruangan...</div>
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
        <h1 className="text-2xl font-bold text-white">Form Peminjaman Ruangan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room Info */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold text-black mb-4">Informasi Ruangan</h3>
          <div className="flex space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
              {room.image ? (
                <Image
                  src={room.image}
                  alt={room.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">ROOM</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-black mb-1">{room.name}</h4>
              <div className="flex items-center text-gray-600 mb-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{room.building.name}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span className="text-sm">Kapasitas: {room.capacity} orang</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="text-sm">Fasilitas: {room.facilities}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Information with Edit Option */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-black">Waktu Peminjaman</h3>
            <button
              type="button"
              onClick={() => setShowTimeEditor(!showTimeEditor)}
              className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
            >
              <Edit className="w-4 h-4 mr-1" />
              {showTimeEditor ? 'Tutup' : 'Ubah Waktu'}
            </button>
          </div>
          
          {showTimeEditor ? (
            // Time Editor
            <div className="space-y-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Tanggal:
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Jam Mulai:
                  </label>
                  <select
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                  >
                    {generateTimeOptions().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Jam Selesai:
                  </label>
                  <select
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                  >
                    {generateTimeOptions().filter(time => time > formData.startTime).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleTimeChange}
                  className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Cek Ketersediaan Waktu Baru
                </button>
                <button
                  type="button"
                  onClick={() => setShowTimeEditor(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            // Time Display
            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium">Tanggal:</span>
                <span className="ml-2">{formatDate(formData.date)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-medium">Waktu:</span>
                <span className="ml-2">{formData.startTime} - {formData.endTime} WIB</span>
              </div>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold text-black mb-4">Detail Kegiatan</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Nama Kegiatan *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Contoh: Seminar Teknologi AI"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Deskripsi Kegiatan *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Jelaskan detail kegiatan yang akan dilaksanakan..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Jumlah Peserta *
                </label>
                <input
                  type="number"
                  name="participantCount"
                  value={formData.participantCount}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max={room.capacity}
                  placeholder="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal {room.capacity} orang
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nomor Ponsel *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="08xxxxxxxxxx"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Nama Koordinator *
              </label>
              <input
                type="text"
                name="coordinatorName"
                value={formData.coordinatorName}
                onChange={handleInputChange}
                required
                placeholder="Nama lengkap koordinator kegiatan"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold text-black mb-4">Upload Proposal</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {uploadedFile ? (
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                  <div>
                    <p className="font-medium text-black">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Klik untuk upload proposal atau drag & drop file di sini
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Format: PDF, Maksimal 10MB
                </p>
                <input
                  type="file"
                  id="proposal"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="proposal"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Pilih File
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-lg p-4">
          <button
            type="submit"
            disabled={loading || !uploadedFile}
            className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Mengirim...' : 'Kirim Permintaan'}
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Dengan mengirim permintaan, Anda menyetujui bahwa data yang diberikan adalah benar
          </p>
        </div>
      </form>
    </div>
  )
}