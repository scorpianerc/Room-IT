// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin(): Promise<void> {
  try {
    console.log('🚀 Memulai proses pembuatan Super Admin...');

    // Konfigurasi Super Admin
    const superAdminData = {
      name: 'Super Administrator',
      email: 'superadmin@filkom.ub.ac.id', // Ganti dengan email yang diinginkan
      password: 'SuperAdmin123', // Ganti dengan password yang kuat
      role: 'SUPER_ADMIN' as const
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(superAdminData.password, 12);
    
    // Cek apakah super admin sudah ada
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        role: 'SUPER_ADMIN'
      }
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin sudah ada:');
      console.log('   📧 Email:', existingSuperAdmin.email);
      console.log('   👤 Nama:', existingSuperAdmin.name);
      console.log('   🆔 ID:', existingSuperAdmin.id);
      return;
    }

    // Cek apakah email sudah digunakan
    const existingUser = await prisma.user.findUnique({
      where: {
        email: superAdminData.email
      }
    });

    if (existingUser) {
      console.log('❌ Email sudah digunakan oleh user lain:', existingUser.email);
      console.log('   Role existing user:', existingUser.role);
      return;
    }

    // Buat super admin baru
    const superAdmin = await prisma.user.create({
      data: {
        name: superAdminData.name,
        email: superAdminData.email,
        password: hashedPassword,
        role: superAdminData.role,
        emailVerified: new Date(), // Langsung verified
      }
    });

    console.log('✅ Super Admin berhasil dibuat!');
    console.log('   🆔 ID:', superAdmin.id);
    console.log('   👤 Nama:', superAdmin.name);
    console.log('   📧 Email:', superAdmin.email);
    console.log('   🔑 Role:', superAdmin.role);
    console.log('   📅 Dibuat:', superAdmin.createdAt.toISOString());
    
  } catch (error) {
    console.error('❌ Error membuat Super Admin:', error);
    
    if (error instanceof Error) {
      console.error('   Detail error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection ditutup');
  }
}



async function main(): Promise<void> {
  console.log('🌱 Starting seed...\n');
  
  await createSuperAdmin();
  
  console.log('\n🌱 Seed completed!');
}

// Jalankan main function
main()
  .catch((e) => {
    console.error('💥 Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });