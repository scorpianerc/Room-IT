// src/app/api/rooms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
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

      const room = await prisma.room.findUnique({
        where: { id },
        include: {
          building: true
        }
      })

      if (!room) {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(room)
    } catch (error) {
      console.error('Failed to fetch room:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}