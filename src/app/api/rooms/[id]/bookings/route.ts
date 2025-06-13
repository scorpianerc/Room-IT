// src/app/api/rooms/[id]/bookings/route.ts
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
      const { id: roomId } = params
      const { searchParams } = new URL(request.url)
      const date = searchParams.get('date')

      if (!date) {
        return NextResponse.json(
          { error: 'Date parameter is required' },
          { status: 400 }
        )
      }

      const selectedDate = new Date(date)
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const bookings = await prisma.booking.findMany({
        where: {
          roomId: roomId,
          startTime: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: {
            in: ['PENDING', 'APPROVED']
          }
        },
        include: {
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

      return NextResponse.json(bookings)
    } catch (error) {
      console.error('Failed to fetch room bookings:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}