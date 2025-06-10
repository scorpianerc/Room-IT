// src/app/api/admin/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const rooms = await prisma.room.findMany({
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const capacity = parseInt(formData.get('capacity') as string)
    const facilities = formData.get('facilities') as string
    const buildingId = formData.get('buildingId') as string
    const image = formData.get('image') as File | null

    let imagePath = null

    // Handle image upload
    if (image) {
      // Validate image
      if (!image.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File harus berupa gambar' }, { status: 400 })
      }

      if (image.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'rooms')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const originalName = image.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}-${originalName}`
      const filepath = join(uploadDir, filename)

      // Save file
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)

      imagePath = `/uploads/rooms/${filename}`
    }

    // Create room in database
    const room = await prisma.room.create({
      data: {
        name,
        capacity,
        facilities,
        buildingId,
        image: imagePath
      },
      include: {
        building: true
      }
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error('Failed to create room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}