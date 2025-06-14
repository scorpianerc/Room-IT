// src/app/api/admin/bookings/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RequestContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
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

      const { status } = await request.json()

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: { status },
        include: {
          user: true,
          room: {
            include: {
              building: true
            }
          }
        }
      })

      const formattedDate = new Date(booking.startTime).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const formattedTime = `${new Date(booking.startTime).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })} - ${new Date(booking.endTime).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })} WIB`

      const notificationMessage = status === 'APPROVED' 
        ? `Selamat! Permintaan peminjaman ruangan Anda telah DISETUJUI.

Kegiatan: ${booking.title}
Ruangan: ${booking.room.name} - ${booking.room.building.name}
Tanggal: ${formattedDate}
Waktu: ${formattedTime}

Ruangan siap digunakan sesuai jadwal. Pastikan untuk datang tepat waktu dan menjaga kebersihan ruangan.`
        : `Mohon maaf, permintaan peminjaman ruangan Anda telah DITOLAK.

Kegiatan: ${booking.title}
Ruangan: ${booking.room.name} - ${booking.room.building.name}
Tanggal: ${formattedDate}
Waktu: ${formattedTime}

Silakan hubungi admin untuk informasi lebih lanjut atau ajukan permintaan baru dengan penyesuaian.`

      await prisma.notification.create({
        data: {
          title: `Booking ${status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}`,
          message: notificationMessage,
          userId: booking.userId
        }
      })

      const adminName = session.user.name || 'Admin'
      const otherAdmins = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN']
          },
          id: {
            not: session.user.id
          }
        },
        select: {
          id: true
        }
      })

      if (otherAdmins.length > 0) {
        const adminNotifications = otherAdmins.map(admin => ({
          title: `Booking ${status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}`,
          message: `${adminName} telah ${status === 'APPROVED' ? 'menyetujui' : 'menolak'} booking:

Kegiatan: ${booking.title}
Pemohon: ${booking.user.name}
Ruangan: ${booking.room.name} - ${booking.room.building.name}
Tanggal: ${formattedDate}`,
          userId: admin.id
        }))

        await prisma.notification.createMany({
          data: adminNotifications
        })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Failed to update booking status:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}