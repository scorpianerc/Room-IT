// src/app/(dashboard)/admin/rooms/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Building, Plus, Edit, Trash2, MapPin, Users, Settings, Upload, X, Check, ChevronDown } from 'lucide-react'
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

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)

  useEffect(() => {
    fetchRooms()
    fetchBuildings()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/admin/rooms')
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

  const deleteRoom = async (roomId: string) => {
    if (!confirm('Yakin ingin menghapus ruangan ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setRooms(rooms.filter(room => room.id !== roomId))
        alert('Ruangan berhasil dihapus')
      } else {
        alert('Gagal menghapus ruangan')
      }
    } catch (error) {
      console.error('Failed to delete room:', error)
      alert('Terjadi kesalahan')
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center">Memuat data ruangan...</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Kelola Ruangan</h1>
          <p className="text-gray-300">Kelola data ruangan dan fasilitasnya</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Ruangan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <Building className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{rooms.length}</p>
              <p className="text-gray-600 text-sm">Total Ruangan</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <MapPin className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{buildings.length}</p>
              <p className="text-gray-600 text-sm">Total Gedung</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">
                {rooms.reduce((total, room) => total + room.capacity, 0)}
              </p>
              <p className="text-gray-600 text-sm">Total Kapasitas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              {room.image ? (
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">ROOM</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg text-black mb-2">{room.name}</h3>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{room.building.name}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Kapasitas: {room.capacity} orang</span>
                </div>
                {room.facilities && (
                  <div className="flex items-start">
                    <Settings className="w-4 h-4 mr-2 mt-0.5" />
                    <span className="line-clamp-2">{room.facilities}</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingRoom(room)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => deleteRoom(room.id)}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada ruangan yang terdaftar</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingRoom) && (
        <RoomModal
          room={editingRoom}
          buildings={buildings}
          onClose={() => {
            setShowAddModal(false)
            setEditingRoom(null)
          }}
          onSave={() => {
            fetchRooms()
            setShowAddModal(false)
            setEditingRoom(null)
          }}
        />
      )}
    </div>
  )
}

// Room Modal Component with Custom Dropdown
function RoomModal({ 
  room, 
  buildings, 
  onClose, 
  onSave 
}: { 
  room: Room | null
  buildings: Building[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: room?.name || '',
    capacity: room?.capacity || '',
    facilities: room?.facilities || '',
    buildingId: room?.building.id || '',
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(room?.image || null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Building dropdown states
  const [selectedBuildingName, setSelectedBuildingName] = useState(
    room?.building.name || 'Pilih Gedung'
  )
  const [isBuildingDropdownOpen, setIsBuildingDropdownOpen] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('modal-building-dropdown')
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsBuildingDropdownOpen(false)
      }
    }

    if (isBuildingDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isBuildingDropdownOpen])

  const handleBuildingSelect = (buildingId: string, buildingName: string) => {
    setFormData({ ...formData, buildingId })
    setSelectedBuildingName(buildingName)
    setIsBuildingDropdownOpen(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB')
        return
      }

      setSelectedImage(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    const fileInput = document.getElementById('room-image') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setUploadProgress(0)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('capacity', formData.capacity.toString())
      formDataToSend.append('facilities', formData.facilities)
      formDataToSend.append('buildingId', formData.buildingId)
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage)
      }

      const url = room 
        ? `/api/admin/rooms/${room.id}`
        : '/api/admin/rooms'
      
      const method = room ? 'PUT' : 'POST'

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(url, {
        method,
        body: formDataToSend
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        onSave()
        alert(`Ruangan berhasil ${room ? 'diupdate' : 'ditambahkan'}`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || `Gagal ${room ? 'mengupdate' : 'menambahkan'} ruangan`)
      }
    } catch (error) {
      console.error('Failed to save room:', error)
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-black">
              {room ? 'Edit Ruangan' : 'Tambah Ruangan'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Gambar Ruangan
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Klik untuk upload gambar ruangan
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Format: JPG, PNG, GIF. Maksimal 5MB
                    </p>
                    <input
                      type="file"
                      id="room-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="room-image"
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      Pilih Gambar
                    </label>
                  </div>
                </div>
              )}
              
              {loading && uploadProgress > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Mengupload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nama Ruangan *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                  placeholder="Contoh: Lab Komputer 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Kapasitas *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                  placeholder="Jumlah orang"
                />
              </div>
            </div>

            {/* Custom Building Dropdown */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Gedung *
              </label>
              <div className="relative" id="modal-building-dropdown">
                <button
                  type="button"
                  onClick={() => setIsBuildingDropdownOpen(!isBuildingDropdownOpen)}
                  className={`w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black transition-colors hover:bg-gray-50 ${
                    !formData.buildingId ? 'text-gray-500' : ''
                  }`}
                >
                  <span className="text-left truncate">{selectedBuildingName}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isBuildingDropdownOpen ? 'transform rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {isBuildingDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {buildings.map((building) => (
                      <button
                        key={building.id}
                        type="button"
                        onClick={() => handleBuildingSelect(building.id, building.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          formData.buildingId === building.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{building.name}</div>
                          {building.code && (
                            <div className="text-sm text-gray-500">{building.code}</div>
                          )}
                        </div>
                        {formData.buildingId === building.id && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Fasilitas
              </label>
              <textarea
                value={formData.facilities}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                placeholder="Contoh: Proyektor, AC, Whiteboard, Sound System, WiFi, dll"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {room ? 'Mengupdate...' : 'Menambahkan...'}
                  </>
                ) : (
                  room ? 'Update Ruangan' : 'Tambah Ruangan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}