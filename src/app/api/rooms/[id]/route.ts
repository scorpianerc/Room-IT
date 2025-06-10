// src/app/api/rooms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id

    const room = await prisma.room.findUnique({
      where: {
        id: roomId
      },
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
}