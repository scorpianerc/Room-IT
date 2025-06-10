// src/app/api/buildings/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const buildings = await prisma.building.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(buildings)
  } catch (error) {
    console.error('Failed to fetch buildings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}