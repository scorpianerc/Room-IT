// src/app/(dashboard)/rooms/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Check, MapPin } from 'lucide-react'
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
  const [selectedBuildingName, setSelectedBuildingName] = useState<string>('Semua Gedung')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('building-dropdown')
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

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

  const handleBuildingSelect = (buildingId: string, buildingName: string) => {
    setSelectedBuilding(buildingId)
    setSelectedBuildingName(buildingName)
    setIsDropdownOpen(false)
  }

  const handleShowAll = () => {
    setSelectedBuilding('')
    setSelectedBuildingName('Semua Gedung')
    setIsDropdownOpen(false)
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Ruangan</h1>
        <p className="text-gray-300">Pilih ruangan untuk melihat jadwal dan melakukan pemesanan</p>
      </div>

      {/* Custom Building Filter Dropdown */}
      <div className="mb-6">
        <div className="relative" id="building-dropdown">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center">
              <span className="text-left truncate">{selectedBuildingName}</span>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {/* Show All Option */}
              <button
                onClick={handleShowAll}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedBuilding === '' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
              >
                <span>Semua Gedung</span>
                {selectedBuilding === '' && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>

              {/* Building Options */}
              {buildings.map((building) => (
                <button
                  key={building.id}
                  onClick={() => handleBuildingSelect(building.id, building.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedBuilding === building.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  <div>
                    <div className="font-medium">{building.name}</div>
                    {building.code && (
                      <div className="text-sm text-gray-500">{building.code}</div>
                    )}
                  </div>
                  {selectedBuilding === building.id && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rooms List */}
      <div className="space-y-4">
        {rooms.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {selectedBuilding 
                ? `Tidak ada ruangan ditemukan di ${selectedBuildingName}`
                : 'Tidak ada ruangan ditemukan'
              }
            </p>
            {selectedBuilding && (
              <button
                onClick={handleShowAll}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Lihat semua ruangan
              </button>
            )}
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
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
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