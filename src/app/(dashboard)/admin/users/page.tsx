// src/app/(dashboard)/admin/users/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, Edit, Trash2, Shield, User, Search, Filter, Eye, EyeOff, Lock, Check, ChevronDown } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN'
  createdAt: string
  updatedAt: string
  _count: {
    bookings: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN'>('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState<User | null>(null)

  // Role filter dropdown states
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  const [selectedRoleName, setSelectedRoleName] = useState('Semua Role')

  useEffect(() => {
    fetchUsers()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('role-filter-dropdown')
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false)
      }
    }

    if (isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isRoleDropdownOpen])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Yakin ingin menghapus user ini? Semua data terkait akan ikut terhapus.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId))
        alert('User berhasil dihapus')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Gagal menghapus user')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Terjadi kesalahan')
    }
  }

  const resetPassword = async (userId: string, newPassword: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      })

      if (response.ok) {
        alert('Password berhasil direset')
        setShowPasswordModal(null)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Gagal reset password')
      }
    } catch (error) {
      console.error('Failed to reset password:', error)
      alert('Terjadi kesalahan')
    }
  }

  const handleRoleFilter = (role: 'ALL' | 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN', roleName: string) => {
    setRoleFilter(role)
    setSelectedRoleName(roleName)
    setIsRoleDropdownOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500'
      case 'ADMIN':
        return 'bg-blue-500'
      case 'STUDENT':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin'
      case 'ADMIN':
        return 'Admin'
      case 'STUDENT':
        return 'Student'
      default:
        return role
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'STUDENT').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    superAdmins: users.filter(u => u.role === 'SUPER_ADMIN').length,
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center">Memuat data users...</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Kelola Users</h1>
          <p className="text-gray-300">Kelola akun pengguna dan hak akses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-gray-600 text-sm">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <User className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.students}</p>
              <p className="text-gray-600 text-sm">Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.admins}</p>
              <p className="text-gray-600 text-sm">Admins</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.superAdmins}</p>
              <p className="text-gray-600 text-sm">Super Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
            />
          </div>

          {/* Custom Role Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <div className="relative" id="role-filter-dropdown">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white hover:bg-gray-50 transition-colors min-w-[140px]"
              >
                <span className="text-sm">{selectedRoleName}</span>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-2 ${
                    isRoleDropdownOpen ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              
              {isRoleDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[140px]">
                  <button
                    onClick={() => handleRoleFilter('ALL', 'Semua Role')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm border-b border-gray-100 ${
                      roleFilter === 'ALL' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <span>Semua Role</span>
                    {roleFilter === 'ALL' && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleRoleFilter('STUDENT', 'Student')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm border-b border-gray-100 ${
                      roleFilter === 'STUDENT' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <span>Student</span>
                    {roleFilter === 'STUDENT' && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleRoleFilter('ADMIN', 'Admin')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm border-b border-gray-100 ${
                      roleFilter === 'ADMIN' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <span>Admin</span>
                    {roleFilter === 'ADMIN' && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleRoleFilter('SUPER_ADMIN', 'Super Admin')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                      roleFilter === 'SUPER_ADMIN' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <span>Super Admin</span>
                    {roleFilter === 'SUPER_ADMIN' && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bergabung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || roleFilter !== 'ALL' ? 'Tidak ada user yang sesuai filter' : 'Belum ada user terdaftar'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getRoleColor(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user._count.bookings} booking
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowPasswordModal(user)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                          title="Reset Password"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || editingUser) && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowAddModal(false)
            setEditingUser(null)
          }}
          onSave={() => {
            fetchUsers()
            setShowAddModal(false)
            setEditingUser(null)
          }}
        />
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <PasswordResetModal
          user={showPasswordModal}
          onClose={() => setShowPasswordModal(null)}
          onReset={resetPassword}
        />
      )}
    </div>
  )
}

// User Modal Component with Custom Role Dropdown
function UserModal({ 
  user, 
  onClose, 
  onSave 
}: { 
  user: User | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'STUDENT',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  // Role dropdown states
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  const [selectedRoleName, setSelectedRoleName] = useState(
    user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 
    user?.role === 'ADMIN' ? 'Admin' : 
    user?.role === 'STUDENT' ? 'Student' : 'Student'
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('user-role-dropdown')
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false)
      }
    }

    if (isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isRoleDropdownOpen])


const handleRoleSelect = (role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN', roleName: string) => {
  setFormData({ ...formData, role })
  setSelectedRoleName(roleName)
  setIsRoleDropdownOpen(false)
}

  // Dalam function UserModal, update bagian handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!user && formData.password !== formData.confirmPassword) {
    alert('Password tidak cocok')
    return
  }

  setLoading(true)

  try {
    const url = user 
      ? `/api/admin/users/${user.id}`
      : '/api/admin/users'
    
    const method = user ? 'PUT' : 'POST'

    const body = user 
      ? {
          name: formData.name,
          email: formData.email,
          role: formData.role as 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN' // Type assertion
        }
      : {
          name: formData.name,
          email: formData.email,
          role: formData.role as 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN', // Type assertion
          password: formData.password
        }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      onSave()
      alert(`User berhasil ${user ? 'diupdate' : 'ditambahkan'}`)
    } else {
      const errorData = await response.json()
      alert(errorData.error || `Gagal ${user ? 'mengupdate' : 'menambahkan'} user`)
    }
  } catch (error) {
    console.error('Failed to save user:', error)
    alert('Terjadi kesalahan')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-black mb-4">
          {user ? 'Edit User' : 'Tambah User'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
            />
          </div>

          {/* Custom Role Dropdown */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Role *
            </label>
            <div className="relative" id="user-role-dropdown">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black transition-colors hover:bg-gray-50"
              >
                <span className="text-left">{selectedRoleName}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    isRoleDropdownOpen ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              
              {isRoleDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('STUDENT', 'Student')}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      formData.role === 'STUDENT' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <span>Student</span>
                    {formData.role === 'STUDENT' && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('ADMIN', 'Admin')}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      formData.role === 'ADMIN' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <span>Admin</span>
                    {formData.role === 'ADMIN' && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('SUPER_ADMIN', 'Super Admin')}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      formData.role === 'SUPER_ADMIN' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <span>Super Admin</span>
                    {formData.role === 'SUPER_ADMIN' && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {!user && (
            <>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Konfirmasi Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : (user ? 'Update' : 'Tambah')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Password Reset Modal Component
function PasswordResetModal({ 
  user, 
  onClose, 
  onReset 
}: { 
  user: User
  onClose: () => void
  onReset: (userId: string, password: string) => void
}) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      alert('Password tidak cocok')
      return
    }

    if (password.length < 6) {
      alert('Password minimal 6 karakter')
      return
    }

    setLoading(true)
    await onReset(user.id, password)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-black mb-4">Reset Password</h2>
        
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Reset password untuk: <strong>{user.name}</strong> ({user.email})
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Password Baru *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Konfirmasi Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
              placeholder="Ulangi password baru"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Mereset...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}