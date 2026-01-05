/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js <adminID> <password> <fname> <lname> <phone>
 * Example: node scripts/create-admin.js admin password123 Admin User 1234567890
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length < 5) {
    console.error('Usage: node create-admin.js <adminID> <password> <fname> <lname> <phone> [dob] [isMale]');
    console.error('Example: node create-admin.js admin password123 Admin User 1234567890 1990-01-01 true');
    process.exit(1);
  }

  const [adminID, password, fname, lname, phone, dob = '1990-01-01', isMale = 'true'] = args;

  try {
    // Check if admin already exists
    const existing = await prisma.admin.findUnique({
      where: { adminID }
    });

    if (existing) {
      console.error(`Admin with ID "${adminID}" already exists!`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        adminID,
        fname,
        lname,
        dob: new Date(dob),
        isMale: isMale === 'true',
        password: hashedPassword,
        phoneNumber: phone
      }
    });

    console.log('✅ Admin created successfully!');
    console.log(`Admin ID: ${admin.adminID}`);
    console.log(`Name: ${admin.fname} ${admin.lname}`);
    console.log(`Phone: ${admin.phoneNumber}`);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

