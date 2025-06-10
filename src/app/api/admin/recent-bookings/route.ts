// src/app/api/admin/recent-bookings/route.ts
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

    const recentBookings = await prisma.booking.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        room: {
          include: {
            building: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(recentBookings)
  } catch (error) {
    console.error('Failed to fetch recent bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}