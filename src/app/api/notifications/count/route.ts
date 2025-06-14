// src/app/api/notifications/count/route.ts
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

    // Auto-delete old notifications
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    await prisma.notification.deleteMany({
      where: {
        userId: session.user.id,
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    })

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false
      }
    })

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error('Failed to fetch notification count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}