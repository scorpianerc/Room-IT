// src/components/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import { Bell, User, Menu, X, LogOut, Home, Building, FileText, BarChart3, Shield, Calendar } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { data: session, status } = useSession()

  const isAuthenticated = status === 'authenticated' && session?.user
  const userRole = session?.user?.role
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  // Fetch notification count
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationCount()
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchNotificationCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('/api/notifications/count')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error)
    }
  }

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const profileMenu = document.getElementById('profile-menu')
      const profileButton = document.getElementById('profile-button')
      
      if (profileMenu && !profileMenu.contains(event.target as Node) && 
          profileButton && !profileButton.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Close mobile menu when clicking outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false)
    }
  }

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (status === 'loading') {
    return (
      <nav className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2"></div>
          <div className="text-black">Loading...</div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="bg-white shadow-sm px-4 py-3 relative z-40">
        <div className="flex items-center justify-between">
          {/* Logo - Different link for admin */}
          <Link href={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="h-10 relative">
              <Image
                src="/images/roomit.svg"
                alt="Room IT Logo"
                width={100}
                height={40}
                className="object-contain"
                onError={(e) => {
                  // Fallback jika gambar tidak ada
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.classList.remove('hidden');
                  }
                }}
              />
            </div>
          </Link>

          {/* Right side icons - only show if authenticated */}
          {isAuthenticated && (
            <div className="flex items-center space-x-2">
              {/* Notification Bell with Badge */}
              <Link 
                href="/notifications" 
                className="p-2 hover:bg-gray-100 rounded-full relative"
                onClick={() => {
                  // Reset count when clicking notifications
                  setUnreadCount(0)
                }}
              >
                <Bell className="w-5 h-5 text-black" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  id="profile-button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <User className="w-5 h-5 text-black" />
                </button>
                
                {isProfileMenuOpen && (
                  <div 
                    id="profile-menu"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200 max-w-[85vw]"
                  >
                    {/* User Info Section */}
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 text-sm leading-tight break-words">
                          {session.user.name && session.user.name.length > 25 
                            ? truncateText(session.user.name, 25)
                            : session.user.name}
                        </p>
                        <p className="text-gray-500 text-xs leading-tight break-all">
                          {session.user.email && session.user.email.length > 30
                            ? truncateText(session.user.email, 30)
                            : session.user.email}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          isSuperAdmin 
                            ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200' 
                            : isAdmin 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {session.user.role}
                        </span>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      {/* Logout */}
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false)
                          signOut({ callbackUrl: '/login' })
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2 text-red-500" />
                        <span className="truncate">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hamburger Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isMobileMenuOpen ? 
                  <X className="w-5 h-5 text-black" /> : 
                  <Menu className="w-5 h-5 text-black" />
                }
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay - only show if authenticated */}
      {isAuthenticated && (
        <div 
          className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen 
              ? 'opacity-100 visible' 
              : 'opacity-0 invisible'
          }`}
          onClick={handleOverlayClick}
        >
          {/* Backdrop with blur effect */}
          <div 
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Slide-in menu from right */}
          <div 
            className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen 
                ? 'translate-x-0' 
                : 'translate-x-full'
            }`}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-black">
                {isSuperAdmin ? 'Super Admin Menu' : isAdmin ? 'Admin Menu' : 'Menu'}
              </h2>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex flex-col h-full">
              {/* Info Box - Different content for admin */}
              <div className="p-4">
                <div className={`text-white p-4 rounded-lg ${
                  isSuperAdmin 
                    ? 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600' 
                    : isAdmin 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                    : 'bg-blue-600'
                }`}>
                  <h3 className="font-bold text-lg mb-2">
                    {isSuperAdmin ? 'Super Admin Panel' : isAdmin ? 'Admin Panel' : 'Room IT'}
                  </h3>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    {isSuperAdmin
                      ? 'Panel super administrator dengan akses penuh untuk mengelola seluruh sistem FILKOM UB. Kontrol penuh atas semua fitur dan pengaturan.'
                      : isAdmin 
                      ? 'Panel administrasi untuk mengelola sistem peminjaman ruangan FILKOM UB. Kelola booking, ruangan, dan pengguna dengan mudah.'
                      : 'Sistem peminjaman ruangan digital untuk Fakultas Ilmu Komputer Universitas Brawijaya. Kelola reservasi ruangan dengan mudah dan efisien.'
                    }
                  </p>
                </div>
              </div>

              {/* Menu Items - Different for admin */}
              <div className="flex-1 px-4 overflow-y-auto">
                <div className="flex flex-col space-y-1">
                  {isAdmin ? (
                    // Admin Menu Items
                    <>
                      <Link 
                        href="/admin/dashboard" 
                        className="flex items-center px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-black border-b border-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className={`w-5 h-5 ${isSuperAdmin ? 'text-red-600' : 'text-purple-600'}`} />
                        <span className="ml-3 text-lg">
                          {isSuperAdmin ? 'Super Admin Dashboard' : 'Dashboard Admin'}
                        </span>
                      </Link>

                      <Link 
                        href="/admin/bookings" 
                        className="flex items-center px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-black border-b border-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <span className="ml-3 text-lg">Kelola Booking</span>
                      </Link>

                      <Link 
                        href="/admin/rooms" 
                        className="flex items-center px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-black border-b border-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Building className="w-5 h-5 text-gray-600" />
                        <span className="ml-3 text-lg">Kelola Ruangan</span>
                      </Link>

                      <Link 
                        href="/admin/users" 
                        className="flex items-center px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-black border-b border-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="ml-3 text-lg">Kelola Users</span>
                      </Link>
                    </>
                  ) : (
                    // Regular User Menu Items
                    <>
                      <Link 
                        href="/" 
                        className="flex items-center px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-black border-b border-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Home className="w-5 h-5 text-gray-600" />
                        <span className="ml-3 text-lg">Home</span>
                      </Link>
                      
                      <Link 
                        href="/rooms" 
                        className="flex items-center px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-black border-b border-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Building className="w-5 h-5 text-gray-600" />
                        <span className="ml-3 text-lg">Ruangan</span>
                      </Link>
                      
                      <Link 
                        href="/cara-pesan" 
                        className="flex items-center px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-black border-b border-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="ml-3 text-lg">Cara Pesan</span>
                      </Link>
                      
                      <Link 
                        href="/status" 
                        className="flex items-center px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-black border-b border-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BarChart3 className="w-5 h-5 text-gray-600" />
                        <span className="ml-3 text-lg">Cek Status</span>
                      </Link>
                    </>
                  )}

                  {/* Logout Menu Item */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      signOut({ callbackUrl: '/login' })
                    }}
                    className="flex items-center w-full px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-red-600 border-b border-gray-100"
                  >
                    <LogOut className="w-5 h-5 text-red-600" />
                    <span className="ml-3 text-lg">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}