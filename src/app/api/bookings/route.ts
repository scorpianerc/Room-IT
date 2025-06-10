// src/app/api/bookings/route.ts (update existing file)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Session debug:', {
      session: session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verifikasi user ada di database
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    console.log('User exists check:', {
      userId: session.user.id,
      userExists: !!userExists,
      userData: userExists ? { id: userExists.id, email: userExists.email } : null
    })

    if (!userExists) {
      return NextResponse.json({ 
        error: 'User tidak ditemukan di database',
        debug: { userId: session.user.id }
      }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('proposal') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Proposal file is required' }, { status: 400 })
    }

    // Validasi file
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File harus berformat PDF' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json({ error: 'File maksimal 10MB' }, { status: 400 })
    }

    // Pastikan folder uploads ada - buat jika belum ada
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
        console.log('Created uploads directory:', uploadDir)
      }
    } catch (mkdirError) {
      console.error('Failed to create uploads directory:', mkdirError)
      return NextResponse.json(
        { error: 'Gagal membuat folder upload' },
        { status: 500 }
      )
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Bersihkan nama file dari karakter yang tidak diinginkan
    const cleanFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    
    const filename = `${Date.now()}-${cleanFileName}`
    const filepath = join(uploadDir, filename)
    
    try {
      await writeFile(filepath, buffer)
      console.log('File saved successfully:', filepath)
    } catch (writeError) {
      console.error('Failed to write file:', writeError)
      return NextResponse.json(
        { error: 'Gagal menyimpan file' },
        { status: 500 }
      )
    }

    // Ambil data dari form
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string
    const participantCountStr = formData.get('participantCount') as string
    const coordinatorName = formData.get('coordinatorName') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const roomId = formData.get('roomId') as string

    // Validasi data
    if (!title || !description || !date || !startTime || !endTime || !participantCountStr || !coordinatorName || !phoneNumber || !roomId) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    const participantCount = parseInt(participantCountStr)
    if (isNaN(participantCount) || participantCount <= 0) {
      return NextResponse.json({ error: 'Jumlah peserta harus berupa angka positif' }, { status: 400 })
    }

    // Validasi waktu
    const startDateTime = new Date(`${date}T${startTime}:00`)
    const endDateTime = new Date(`${date}T${endTime}:00`)

    if (startDateTime >= endDateTime) {
      return NextResponse.json({ error: 'Jam selesai harus lebih besar dari jam mulai' }, { status: 400 })
    }

    if (startDateTime < new Date()) {
      return NextResponse.json({ error: 'Tidak dapat memesan waktu yang sudah berlalu' }, { status: 400 })
    }

    // Cek konflik jadwal
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId: roomId,
        status: {
          in: ['PENDING', 'APPROVED']
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startDateTime } },
              { endTime: { gt: startDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { endTime: { gte: endDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startDateTime } },
              { endTime: { lte: endDateTime } }
            ]
          }
        ]
      }
    })

    if (conflictingBooking) {
      return NextResponse.json({ error: 'Waktu yang dipilih bertabrakan dengan peminjaman lain' }, { status: 400 })
    }

    // Validasi kapasitas ruangan
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        building: true
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Ruangan tidak ditemukan' }, { status: 404 })
    }

    if (participantCount > room.capacity) {
      return NextResponse.json({ error: `Jumlah peserta melebihi kapasitas ruangan (${room.capacity} orang)` }, { status: 400 })
    }

    // Siapkan data booking
    const bookingData = {
      title,
      description,
      startTime: startDateTime,
      endTime: endDateTime,
      proposalUrl: `/uploads/${filename}`,
      proposalName: file.name,
      status: 'PENDING' as const,
      isPublic: true,
      userId: session.user.id,
      roomId: roomId,
      participantCount,
      coordinatorName,
      phoneNumber
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: bookingData
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        title: 'Permintaan Peminjaman Dikirim',
        message: `Permintaan peminjaman ruangan untuk kegiatan "${booking.title}" telah dikirim dan sedang menunggu persetujuan admin.`,
        userId: session.user.id
      }
    })

    // Create notifications for all admins
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true
      }
    })

    // Format tanggal untuk notifikasi admin
    const formattedDate = startDateTime.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const formattedTime = `${startDateTime.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })} - ${endDateTime.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })} WIB`

    // Create notification for each admin
    const adminNotifications = admins.map(admin => ({
      title: 'Permintaan Booking Baru',
      message: `Ada permintaan peminjaman ruangan baru dari ${userExists.name}:
      
Kegiatan: ${title}
Ruangan: ${room.name} - ${room.building.name}
Tanggal: ${formattedDate}
Waktu: ${formattedTime}
Peserta: ${participantCount} orang
Koordinator: ${coordinatorName}

Silakan review dan berikan persetujuan.`,
      userId: admin.id
    }))

    await prisma.notification.createMany({
      data: adminNotifications
    })

    console.log(`Created ${adminNotifications.length} admin notifications for booking ${booking.id}`)

    return NextResponse.json({ 
      success: true, 
      bookingId: booking.id,
      message: 'Permintaan peminjaman berhasil dikirim'
    })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}