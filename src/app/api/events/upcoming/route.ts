// src/app/api/events/upcoming/route.ts
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

    const now = new Date()
    
    // Ambil upcoming events yang approved dari semua user (public events)
    // ATAU events milik user yang sedang login
    const upcomingEvents = await prisma.booking.findMany({
      where: {
        AND: [
          {
            status: 'APPROVED'
          },
          {
            startTime: {
              gte: now
            }
          },
          {
            OR: [
              {
                isPublic: true // Event public bisa dilihat semua orang
              },
              {
                userId: session.user.id // Event pribadi hanya bisa dilihat owner
              }
            ]
          }
        ]
      },
      include: {
        room: {
          include: {
            building: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      },
      take: 10 // Limit 10 events terdekat
    })

    console.log(`Found ${upcomingEvents.length} upcoming events for user ${session.user.email}`)

    return NextResponse.json(upcomingEvents)
  } catch (error) {
    console.error('Failed to fetch upcoming events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}