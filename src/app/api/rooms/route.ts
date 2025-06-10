// src/app/api/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buildingId = searchParams.get('buildingId')

    const rooms = await prisma.room.findMany({
      where: buildingId ? {
        buildingId: buildingId
      } : undefined,
      include: {
        building: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}