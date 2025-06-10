// src/app/api/admin/users/[id]/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(
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

    // Prevent resetting own password through this endpoint
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Gunakan fitur ganti password untuk akun sendiri' }, { status: 400 })
    }

    // Only SUPER_ADMIN can reset SUPER_ADMIN password
    if (existingUser.role === 'SUPER_ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Hanya Super Admin yang dapat reset password Super Admin' }, { status: 403 })
    }

    const { password } = await request.json()

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password
    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword }
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        title: 'Password Direset',
        message: 'Password akun Anda telah direset oleh admin. Silakan login dengan password baru dan segera ganti password jika diperlukan.',
        userId: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to reset password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}