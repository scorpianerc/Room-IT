// src/app/api/admin/rooms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface RequestContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
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

      const userRole = session.user.role
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const existingRoom = await prisma.room.findUnique({
        where: { id }
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

      let imagePath = existingRoom.image

      if (image) {
        if (!image.type.startsWith('image/')) {
          return NextResponse.json({ error: 'File harus berupa gambar' }, { status: 400 })
        }

        if (image.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
        }

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

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'rooms')
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        const timestamp = Date.now()
        const originalName = image.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filename = `${timestamp}-${originalName}`
        const filepath = join(uploadDir, filename)

        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        imagePath = `/uploads/rooms/${filename}`
      }

      const room = await prisma.room.update({
        where: { id },
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

      const userRole = session.user.role
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const room = await prisma.room.findUnique({
        where: { id }
      })

      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }

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

      await prisma.room.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Failed to delete room:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}