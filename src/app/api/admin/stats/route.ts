// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get stats
    const [totalUsers, totalBookings, pendingBookings, approvedBookings] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'APPROVED' } })
    ])

    return NextResponse.json({
      totalUsers,
      totalBookings,
      pendingBookings,
      approvedBookings
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}