// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    // Prevent editing own account
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Tidak dapat mengedit akun sendiri' }, { status: 400 })
    }

    const { name, email, role } = await request.json()

    // Validate input
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    // Check email uniqueness (excluding current user)
    const emailExists = await prisma.user.findFirst({
      where: {
        email,
        id: { not: params.id }
      }
    })

    if (emailExists) {
      return NextResponse.json({ error: 'Email sudah digunakan user lain' }, { status: 400 })
    }

    // Only SUPER_ADMIN can modify SUPER_ADMIN or create SUPER_ADMIN
    if ((existingUser.role === 'SUPER_ADMIN' || role === 'SUPER_ADMIN') && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Hanya Super Admin yang dapat mengelola Super Admin' }, { status: 403 })
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { name, email, role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    // Prevent deleting own account
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 })
    }

    // Only SUPER_ADMIN can delete SUPER_ADMIN
    if (existingUser.role === 'SUPER_ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Hanya Super Admin yang dapat menghapus Super Admin' }, { status: 403 })
    }

    // Delete user (this will cascade delete related data)
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}