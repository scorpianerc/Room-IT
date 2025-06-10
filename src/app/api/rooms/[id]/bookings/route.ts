// src/app/api/rooms/[id]/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Parse tanggal yang dipilih
    const selectedDate = new Date(date)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Optimized query dengan index yang tepat
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: roomId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['PENDING', 'APPROVED'] // Hanya tampilkan yang pending atau approved
        }
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        status: true,
        isPublic: true,
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Set cache headers untuk mengurangi request berulang
    const response = NextResponse.json(bookings)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    
    return response
  } catch (error) {
    console.error('Failed to fetch room bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}