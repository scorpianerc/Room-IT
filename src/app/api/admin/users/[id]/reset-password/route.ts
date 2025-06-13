// src/app/api/admin/users/[id]/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

interface RequestContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
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
        return NextResponse.json({ error: 'Gunakan fitur ganti password untuk akun sendiri' }, { status: 400 })
      }

      if (existingUser.role === 'SUPER_ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Hanya Super Admin yang dapat reset password Super Admin' }, { status: 403 })
      }

      const { password } = await request.json()

      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password, 12)

      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword }
      })

      await prisma.notification.create({
        data: {
          title: 'Password Direset',
          message: 'Password akun Anda telah direset oleh admin. Silakan login dengan password baru dan segera ganti password jika diperlukan.',
          userId: id
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
  })
}