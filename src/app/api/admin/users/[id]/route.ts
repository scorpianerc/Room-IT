// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RequestContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
  request: NextRequest,
  context: RequestContext
) {
  return Promise.resolve().then(async () => {
    try {
      const params = await context.params
      const { id } = params
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const userRole = session.user.role
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const existingUser = await prisma.user.findUnique({
        where: { id }
      })

      if (!existingUser) {
        return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
      }

      if (id === session.user.id) {
        return NextResponse.json({ error: 'Tidak dapat mengedit akun sendiri' }, { status: 400 })
      }

      const { name, email, role } = await request.json()

      if (!name || !email || !role) {
        return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
      }

      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id }
        }
      })

      if (emailExists) {
        return NextResponse.json({ error: 'Email sudah digunakan user lain' }, { status: 400 })
      }

      if ((existingUser.role === 'SUPER_ADMIN' || role === 'SUPER_ADMIN') && userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Hanya Super Admin yang dapat mengelola Super Admin' }, { status: 403 })
      }

      const user = await prisma.user.update({
        where: { id },
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
  })
}

export async function DELETE(
  request: NextRequest,
  context: RequestContext
) {
  return Promise.resolve().then(async () => {
    try {
      const params = await context.params
      const { id } = params
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const userRole = session.user.role
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const existingUser = await prisma.user.findUnique({
        where: { id }
      })

      if (!existingUser) {
        return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
      }

      if (id === session.user.id) {
        return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 })
      }

      if (existingUser.role === 'SUPER_ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Hanya Super Admin yang dapat menghapus Super Admin' }, { status: 403 })
      }

      await prisma.user.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Failed to delete user:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}