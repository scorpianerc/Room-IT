// src/app/(dashboard)/notifications/page.tsx (update existing file)
'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, X, ChevronRight, Trash2, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      })
      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        ))
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const deleteNotification = async (id: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    setDeletingIds(prev => new Set(prev).add(id))
    
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setNotifications(notifications.filter(notif => notif.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
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
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read)
    
    try {
      await Promise.all(
        unreadNotifications.map(notif => 
          fetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' })
        )
      )
      
      setNotifications(notifications.map(notif => ({ ...notif, read: true })))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteAllRead = async () => {
    const readNotifications = notifications.filter(n => n.read)
    
    if (readNotifications.length === 0) {
      alert('Tidak ada notifikasi yang sudah dibaca untuk dihapus')
      return
    }

    if (!confirm(`Hapus ${readNotifications.length} notifikasi yang sudah dibaca?`)) {
      return
    }

    try {
      await Promise.all(
        readNotifications.map(notif => 
          fetch(`/api/notifications/${notif.id}`, { method: 'DELETE' })
        )
      )
      
      setNotifications(notifications.filter(notif => !notif.read))
    } catch (error) {
      console.error('Failed to delete read notifications:', error)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center">Memuat notifikasi...</div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Bell className="w-6 h-6 mr-2" />
          Notifikasi
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
      </div>

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4 mr-1" />
                Tandai Semua Dibaca
              </button>
            )}
            
            <button
              onClick={deleteAllRead}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Hapus yang Dibaca
            </button>
          </div>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Tidak ada notifikasi
          </h3>
          <p className="text-gray-500">
            Notifikasi Anda akan muncul di sini
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Notifikasi akan otomatis terhapus setelah 30 hari
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const isDeleting = deletingIds.has(notification.id)
            
            return (
              <Link
                key={notification.id}
                href={`/notifications/${notification.id}`}
                className={`block bg-white rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-blue-600 shadow-md' : 'shadow-sm'
                } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center mb-2">
                        <h3 className={`text-lg truncate pr-2 ${
                          !notification.read ? 'font-bold text-black' : 'font-semibold text-gray-800'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <button
                          onClick={(e) => markAsRead(notification.id, e)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Tandai sebagai dibaca"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => deleteNotification(notification.id, e)}
                        disabled={isDeleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                        title="Hapus notifikasi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="p-2">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Informasi Notifikasi:</h3>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• Notifikasi akan otomatis terhapus setelah 30 hari</li>
          <li>• Klik pada notifikasi untuk melihat detail lengkap</li>
          <li>• Gunakan tombol aksi untuk mengelola notifikasi</li>
          <li>• Badge merah menunjukkan jumlah notifikasi yang belum dibaca</li>
        </ul>
      </div>
    </div>
  )
}