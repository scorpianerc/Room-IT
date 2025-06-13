// src/app/api/admin/rooms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get existing room
    const existingRoom = await prisma.room.findUnique({
      where: { id: params.id }
    })

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const capacity = parseInt(formData.get('capacity') as string)
    const facilities = formData.get('facilities') as string
    const buildingId = formData.get('buildingId') as string
    const image = formData.get('image') as File | null

    let imagePath = existingRoom.image // Keep existing image by default

    // Handle new image upload
    if (image) {
      // Validate image
      if (!image.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File harus berupa gambar' }, { status: 400 })
      }

      if (image.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
      }

      // Delete old image if exists
      if (existingRoom.image) {
        const oldImagePath = join(process.cwd(), 'public', existingRoom.image)
        if (existsSync(oldImagePath)) {
          try {
            await unlink(oldImagePath)
          } catch (error) {
            console.error('Failed to delete old image:', error)
          }
        }
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

    // Update room in database
    const room = await prisma.room.update({
      where: { id: params.id },
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
    console.error('Failed to update room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get room to delete image
    const room = await prisma.room.findUnique({
      where: { id: params.id }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Delete image file if exists
    if (room.image) {
      const imagePath = join(process.cwd(), 'public', room.image)
      if (existsSync(imagePath)) {
        try {
          await unlink(imagePath)
        } catch (error) {
          console.error('Failed to delete image file:', error)
        }
      }
    }

    // Delete room from database
    await prisma.room.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}