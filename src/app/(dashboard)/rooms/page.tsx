// src/app/(dashboard)/rooms/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Building {
  id: string
  name: string
  code: string
}

interface Room {
  id: string
  name: string
  capacity: number
  facilities: string
  image: string | null
  building: Building
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuildings()
    fetchRooms()
  }, [])

  useEffect(() => {
    if (selectedBuilding) {
      fetchRoomsByBuilding(selectedBuilding)
    } else {
      fetchRooms()
    }
  }, [selectedBuilding])

  const fetchBuildings = async () => {
    try {
      const response = await fetch('/api/buildings')
      if (response.ok) {
        const data = await response.json()
        setBuildings(data)
      }
    } catch (error) {
      console.error('Failed to fetch buildings:', error)
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoomsByBuilding = async (buildingId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/rooms?buildingId=${buildingId}`)
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (error) {
      console.error('Failed to fetch rooms by building:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center">Memuat ruangan...</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Building Filter */}
      <div className="mb-6">
        <div className="relative">
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
          >
            <option value="">Semua Gedung</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-4">
        {rooms.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-gray-500">Tidak ada ruangan ditemukan</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex space-x-4 min-h-[120px]">
                <div className="w-24 flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                    {room.image ? (
                      <Image
                        src={room.image}
                        alt={room.name}
                        width={96}
                        height={120}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback jika gambar gagal dimuat
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {/* Fallback placeholder */}
                    <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center ${room.image ? 'hidden' : ''}`}>
                      <span className="text-white text-xs font-bold">ROOM</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-black">{room.name}</h3>
                    <p className="text-gray-600 text-sm mb-1">
                      Kapasitas: {room.capacity} orang
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      Gedung: {room.building.name}
                    </p>
                    {room.facilities && (
                      <p className="text-gray-600 text-sm mb-3">
                        Fasilitas: {room.facilities}
                      </p>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/rooms/${room.id}/schedule`}
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Lihat Jadwal
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}