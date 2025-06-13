// src/app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RequestContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
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

      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId: session.user.id
        }
      })

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(notification)
    } catch (error) {
      console.error('Failed to fetch notification:', error)
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

      await prisma.notification.delete({
        where: {
          id,
          userId: session.user.id
        }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Failed to delete notification:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}