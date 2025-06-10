// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import Navbar from '@/components/Navbar'

interface UpcomingEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  participantCount?: number
  isPublic: boolean
  room: {
    id: string
    name: string
    image?: string
    building: {
      name: string
    }
  }
  user: {
    name: string
    email: string
  }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUpcomingEvents()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('/api/events/upcoming')
      if (response.ok) {
        const events = await response.json()
        setUpcomingEvents(events)
        console.log('Fetched events:', events)
      } else {
        console.error('Failed to fetch events:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
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

  const isEventToday = (dateString: string) => {
    const eventDate = new Date(dateString).toDateString()
    const today = new Date().toDateString()
    return eventDate === today
  }

  const isEventTomorrow = (dateString: string) => {
    const eventDate = new Date(dateString).toDateString()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return eventDate === tomorrow.toDateString()
  }

  const getDateLabel = (dateString: string) => {
    if (isEventToday(dateString)) return 'Hari ini'
    if (isEventTomorrow(dateString)) return 'Besok'
    return formatDate(dateString)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          {/* Container untuk logo dan form */}
          <div className="bg-white rounded-lg overflow-hidden shadow-xl">
            {/* Mobile Layout - Logo di atas */}
            <div className="block md:hidden">
              {/* Logo Section - bagian atas untuk mobile */}
              <div className="bg-blue-600 p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="h-24 relative mb-4">
                    <Image
                      src="/images/roomit.svg"
                      alt="Room IT Logo"
                      width={300}
                      height={300}
                      className="object-contain"
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

              {/* Welcome Section - bagian bawah untuk mobile */}
              <div className="p-8">
                <h2 className="text-2xl font-bold text-center mb-4 text-black">
                  Selamat Datang di Room IT
                </h2>
                <p className="text-gray-700 text-center mb-8 text-sm leading-relaxed">
                  Web untuk peminjaman ruangan di lingkungan Fakultas Ilmu Komputer. 
                  Web ini memungkinkan pengguna untuk memesan, mengedit, dan mengelola 
                  penggunaan ruangan dengan mudah dan efisien.
                </p>

                <div className="space-y-4">
                  <Link 
                    href="/login"
                    className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold text-center block hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register"
                    className="w-full border border-blue-600 text-blue-600 p-3 rounded-lg font-semibold text-center block hover:bg-blue-50 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>

            {/* Desktop Layout - Logo di samping */}
            <div className="hidden md:flex min-h-[500px]">
              {/* Logo Section - bagian kiri untuk desktop */}
              <div className="bg-blue-600 flex items-center justify-center w-2/5 p-12">
                <div className="text-center">
                  <div className="h-24 relative mb-6">
                    <Image
                      src="/images/roomit.svg"
                      alt="Room IT Logo"
                      width={600}
                      height={600}
                      className="object-contain"
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

              {/* Welcome Section - bagian kanan untuk desktop */}
              <div className="flex items-center justify-center w-3/5 p-12">
                <div className="max-w-md w-full">
                  <h2 className="text-3xl font-bold text-center mb-6 text-black">
                    Selamat Datang di Room IT
                  </h2>
                  <p className="text-gray-700 text-center mb-8 text-base leading-relaxed">
                    Web untuk peminjaman ruangan di lingkungan Fakultas Ilmu Komputer. 
                    Web ini memungkinkan pengguna untuk memesan, mengedit, dan mengelola 
                    penggunaan ruangan dengan mudah dan efisien.
                  </p>

                  <div className="space-y-4">
                    <Link 
                      href="/login"
                      className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold text-center block hover:bg-blue-700 transition-colors text-lg shadow-md"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register"
                      className="w-full border border-blue-600 text-blue-600 p-4 rounded-lg font-semibold text-center block hover:bg-blue-50 transition-colors text-lg"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Halo, {session.user?.name || 'User'}
          </h1>
        </div>

        {/* Upcoming Events Section */}
        <div className="mb-6 -mx-4">
          <div className="bg-blue-600 text-white px-4 py-3">
            <h2 className="font-semibold">Upcoming Event</h2>
          </div>
          
          {loading ? (
            <div className="bg-white p-6">
              <div className="text-center text-gray-500">Memuat events...</div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            /* Empty State - Terpisah dari header biru */
            <div className="px-4 mt-4">
              <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Tidak ada upcoming events
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Belum ada acara yang dijadwalkan dalam waktu dekat
                </p>
                <Link
                  href="/rooms"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Pesan Ruangan
                </Link>
              </div>
            </div>
          ) : (
            /* Events Cards */
            <div className="px-4 mt-4">
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="flex p-3 sm:p-4 gap-3 sm:gap-4">
                      {/* Event Image - Extended Height */}
                      <div className="w-28 sm:w-32 flex-shrink-0 relative overflow-hidden rounded-lg self-stretch">
                        {event.room.image ? (
                          <Image
                            src={event.room.image}
                            alt={event.room.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 112px, 128px"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">ROOM</span>
                          </div>
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-base sm:text-lg text-black truncate pr-2">
                              {event.title}
                            </h3>
                          </div>

                          <div className="space-y-1 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                              <span className="truncate text-xs sm:text-sm">{event.room.name} - {event.room.building.name}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                              <span className="text-xs sm:text-sm">{getDateLabel(event.startTime)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                              <span className="text-xs sm:text-sm">{formatTime(event.startTime, event.endTime)}</span>
                            </div>

                            {event.participantCount && (
                              <div className="flex items-center">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                <span className="text-xs sm:text-sm">{event.participantCount} peserta</span>
                              </div>
                            )}
                          </div>

                          {event.description && (
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-1 sm:mb-2">
                              {event.description}
                            </p>
                          )}
                        </div>

                        {event.isPublic && (
                          <div className="mt-auto">
                            <p className="text-xs text-blue-600 truncate">
                              Diselenggarakan oleh: {event.user.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {upcomingEvents.length >= 10 && (
                <div className="text-center mt-4">
                  <Link
                    href="/events"
                    className="text-blue-600 text-sm hover:text-blue-700"
                  >
                    Lihat semua events →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}