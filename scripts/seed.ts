// scripts/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Hapus data lama terlebih dahulu
  console.log('🗑️ Cleaning up existing data...')
  await prisma.notification.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.room.deleteMany()
  await prisma.building.deleteMany()
  await prisma.user.deleteMany()

  // Create buildings
  console.log('📍 Creating buildings...')
  const building1 = await prisma.building.create({
    data: {
      name: 'Gedung A',
      code: 'GDA'
    }
  })

  const building2 = await prisma.building.create({
    data: {
      name: 'Gedung F',
      code: 'GDF'
    }
  })

  const building3 = await prisma.building.create({
    data: {
      name: 'Gedung G',
      code: 'GDG'
    }
  })

  const building4 = await prisma.building.create({
    data: {
      name: 'Gedung Kreativitas Mahasiswa',
      code: 'GKM'
    }
  })

  // Create rooms
  const room1 = await prisma.room.create({
    data: {
      name: 'Auditorium Algoritma',
      capacity: 100,
      facilities: 'Proyektor, Sound System, AC, Microphone',
      image: '/images/auditorium.png',
      buildingId: building3.id
    }
  })

  const room2 = await prisma.room.create({
    data: {
      name: 'Lab Komputer 1',
      capacity: 40,
      facilities: 'Komputer, Proyektor, AC, Whiteboard',
      image: '/images/lab-computer.jpg',
      buildingId: building3.id
    }
  })

  const room3 = await prisma.room.create({
    data: {
      name: 'Kelas F 4.10',
      capacity: 50,
      facilities: 'Proyektor, AC, Sound System',
      image: '/images/kelas.png',
      buildingId: building2.id
    }
  })

  const room4 = await prisma.room.create({
    data: {
      name: 'Kelas F 2.2',
      capacity: 30,
      facilities: 'Komputer, Switch, Router, Proyektor',
      image: '/images/kelas.png',
      buildingId: building2.id
    }
  })

  // // Create users
  // const hashedAdminPassword = await bcrypt.hash('admin123', 12)
  // const hashedStudentPassword = await bcrypt.hash('student123', 12)
  
  // const adminUser = await prisma.user.create({
  //   data: {
  //     name: 'Admin FILKOM',
  //     email: 'admin@filkom.ub.ac.id',
  //     password: hashedAdminPassword,
  //     role: 'ADMIN'
  //   }
  // })

  // const studentUser1 = await prisma.user.create({
  //   data: {
  //     name: 'Bambang Sutrisno',
  //     email: 'bambang@student.ub.ac.id',
  //     password: hashedStudentPassword,
  //     role: 'STUDENT'
  //   }
  // })

  // const studentUser2 = await prisma.user.create({
  //   data: {
  //     name: 'Sari Dewi',
  //     email: 'sari@student.ub.ac.id',
  //     password: hashedStudentPassword,
  //     role: 'STUDENT'
  //   }
  // })

  // const studentUser3 = await prisma.user.create({
  //   data: {
  //     name: 'Andi Pratama',
  //     email: 'andi@student.ub.ac.id',
  //     password: hashedStudentPassword,
  //     role: 'STUDENT'
  //   }
  // })

  // // Booking 2 - Pending (minggu depan)
  // const nextWeek = new Date()
  // nextWeek.setDate(nextWeek.getDate() + 7)
  // nextWeek.setHours(14, 0, 0, 0)
  // const nextWeekEnd = new Date(nextWeek)
  // nextWeekEnd.setHours(16, 0, 0, 0)

  // const booking2 = await prisma.booking.create({
  //   data: {
  //     title: 'Workshop React JS',
  //     description: 'Workshop pengembangan web dengan React JS untuk mahasiswa tingkat menengah hingga lanjut.',
  //     startTime: nextWeek,
  //     endTime: nextWeekEnd,
  //     status: 'PENDING',
  //     isPublic: true,
  //     participantCount: 30,
  //     coordinatorName: 'Sari Dewi',
  //     phoneNumber: '081987654321',
  //     userId: studentUser2.id,
  //     roomId: room2.id
  //   }
  // })

  // // Booking 3 - Rejected (kemarin)
  // const yesterday = new Date()
  // yesterday.setDate(yesterday.getDate() - 1)
  // yesterday.setHours(10, 0, 0, 0)
  // const yesterdayEnd = new Date(yesterday)
  // yesterdayEnd.setHours(12, 0, 0, 0)

  // const booking3 = await prisma.booking.create({
  //   data: {
  //     title: 'Pelatihan Database',
  //     description: 'Pelatihan database MySQL dan PostgreSQL untuk mahasiswa.',
  //     startTime: yesterday,
  //     endTime: yesterdayEnd,
  //     status: 'REJECTED',
  //     isPublic: true,
  //     participantCount: 25,
  //     coordinatorName: 'Andi Pratama',
  //     phoneNumber: '081122334455',
  //     userId: studentUser3.id,
  //     roomId: room3.id
  //   }
  // })

  // // Booking 4 - Approved (bulan depan)
  // const nextMonth = new Date()
  // nextMonth.setDate(nextMonth.getDate() + 30)
  // nextMonth.setHours(13, 0, 0, 0)
  // const nextMonthEnd = new Date(nextMonth)
  // nextMonthEnd.setHours(15, 0, 0, 0)

  // const booking4 = await prisma.booking.create({
  //   data: {
  //     title: 'Kompetisi Programming',
  //     description: 'Kompetisi programming tingkat fakultas untuk mahasiswa semester 3-7.',
  //     startTime: nextMonth,
  //     endTime: nextMonthEnd,
  //     status: 'APPROVED',
  //     isPublic: true,
  //     participantCount: 45,
  //     coordinatorName: 'Sari Dewi',
  //     phoneNumber: '081234567890',
  //     userId: studentUser2.id,
  //     roomId: room4.id
  //   }
  // })

  // // Create notifications
  // console.log('🔔 Creating sample notifications...')

  // await prisma.notification.create({
  //   data: {
  //     title: 'Peminjaman Menunggu Persetujuan',
  //     message: 'Peminjaman ruangan Lab Komputer 1 untuk acara "Workshop React JS" sedang menunggu persetujuan admin.',
  //     userId: studentUser2.id
  //   }
  // })

  // await prisma.notification.create({
  //   data: {
  //     title: 'Peminjaman Ditolak',
  //     message: 'Peminjaman ruangan Kelas F 4.10 untuk acara "Pelatihan Database" ditolak. Silakan hubungi admin untuk informasi lebih lanjut.',
  //     userId: studentUser3.id
  //   }
  // })

  // await prisma.notification.create({
  //   data: {
  //     title: 'Peminjaman Disetujui',
  //     message: 'Peminjaman ruangan Kelas F 2.2 untuk acara "Kompetisi Programming" telah disetujui.',
  //     userId: studentUser2.id
  //   }
  // })

  console.log('✅ Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Buildings: ${await prisma.building.count()}`)
  console.log(`- Rooms: ${await prisma.room.count()}`)
  console.log(`- Users: ${await prisma.user.count()}`)
  console.log(`- Bookings: ${await prisma.booking.count()}`)
  console.log(`- Notifications: ${await prisma.notification.count()}`)
  
  console.log('\n🔑 Login credentials:')
  console.log('Admin: admin@filkom.ub.ac.id / admin123')
  console.log('Student 1: bambang@student.ub.ac.id / student123')
  console.log('Student 2: sari@student.ub.ac.id / student123')
  console.log('Student 3: andi@student.ub.ac.id / student123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })