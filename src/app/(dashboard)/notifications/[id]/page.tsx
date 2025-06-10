// src/app/(dashboard)/notifications/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, CheckCircle, AlertCircle, XCircle, Bell } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const notificationId = params.id as string
  
  const [notification, setNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (notificationId) {
      fetchNotificationDetail()
    }
  }, [notificationId])

  const fetchNotificationDetail = async () => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`)
      if (response.ok) {
        const data = await response.json()
        setNotification(data)
        
        // Mark as read if not already read
        if (!data.read) {
          markAsRead()
        }
      } else if (response.status === 404) {
        setError('Notifikasi tidak ditemukan')
      } else {
        setError('Gagal memuat notifikasi')
      }
    } catch (error) {
      console.error('Failed to fetch notification detail:', error)
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      if (notification) {
        setNotification({ ...notification, read: true })
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const deleteNotification = async () => {
    if (!confirm('Hapus notifikasi ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        router.push('/notifications')
      } else {
        alert('Gagal menghapus notifikasi')
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
      alert('Terjadi kesalahan saat menghapus notifikasi')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNotificationIcon = () => {
    if (!notification) return <Bell className="w-8 h-8 text-gray-400" />
    
    const title = notification.title.toLowerCase()
    
    if (title.includes('disetujui') || title.includes('approved')) {
      return <CheckCircle className="w-8 h-8 text-green-500" />
    } else if (title.includes('ditolak') || title.includes('rejected')) {
      return <XCircle className="w-8 h-8 text-red-500" />
    } else if (title.includes('menunggu') || title.includes('pending')) {
      return <AlertCircle className="w-8 h-8 text-yellow-500" />
    } else {
      return <Bell className="w-8 h-8 text-blue-500" />
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes < 1 ? 'Baru saja' : `${diffInMinutes} menit yang lalu`
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`
    } else if (diffInHours < 48) {
      return 'Kemarin'
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} hari yang lalu`
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center">Memuat detail notifikasi...</div>
      </div>
    )
  }

  if (error || !notification) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-gray-800 rounded-full mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Detail Notifikasi</h1>
        </div>
        
        <div className="bg-white rounded-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {error || 'Notifikasi tidak ditemukan'}
          </h3>
          <p className="text-gray-500 mb-4">
            Notifikasi mungkin sudah dihapus atau tidak tersedia
          </p>
          <button
            onClick={() => router.push('/notifications')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Notifikasi
          </button>
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
        <h1 className="text-2xl font-bold text-white">Detail Notifikasi</h1>
      </div>

      {/* Notification Detail Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {getNotificationIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {notification.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{getTimeAgo(notification.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    notification.read ? 'bg-gray-400' : 'bg-blue-600'
                  }`}></span>
                  <span>{notification.read ? 'Sudah dibaca' : 'Belum dibaca'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Isi Pesan</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>

          {/* Metadata Section */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Informasi Detail</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">Tanggal Diterima</span>
                </div>
                <p className="text-gray-600 ml-7">
                  {formatDate(notification.createdAt)}
                </p>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                    notification.read ? 'bg-gray-400' : 'bg-blue-600'
                  }`}>
                    {notification.read ? (
                      <CheckCircle className="w-3 h-3 text-white" />
                    ) : (
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    )}
                  </span>
                  <span className="font-medium text-gray-900">Status Baca</span>
                </div>
                <p className="text-gray-600 ml-7">
                  {notification.read ? 'Sudah dibaca' : 'Belum dibaca'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-500">
              Notifikasi akan otomatis terhapus setelah 30 hari
            </div>
            <div className="flex space-x-3">
              {!notification.read && (
                <button
                  onClick={markAsRead}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tandai Dibaca
                </button>
              )}
              <button
                onClick={deleteNotification}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Hapus Notifikasi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Actions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Tips:</h4>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• Notifikasi yang sudah dibaca akan ditandai secara otomatis</li>
          <li>• Anda dapat menghapus notifikasi yang tidak diperlukan</li>
          <li>• Gunakan tombol kembali untuk melihat daftar notifikasi lainnya</li>
        </ul>
      </div>
    </div>
  )
}