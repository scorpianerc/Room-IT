// src/app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

      const notification = await prisma.notification.update({
        where: {
          id,
          userId: session.user.id
        },
        data: {
          read: true
        }
      })

      return NextResponse.json(notification)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}