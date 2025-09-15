import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  const SUPERADMIN_EMAIL = 'superadmin@asyncotel.com';
  const SUPERADMIN_PASSWORD = 'Admin@1234';
  
  try {
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: SUPERADMIN_EMAIL }
    });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
      
      await prisma.user.create({
        data: {
          email: SUPERADMIN_EMAIL,
          password: hashedPassword,
          role: 'SUPERADMIN'
        }
      });
      console.log('✅ Superadmin created with fixed credentials');
    }
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default createSuperAdmin;