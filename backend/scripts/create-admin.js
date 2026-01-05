/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js <adminID> <password> <fname> <lname> <phone>
 * Example: node scripts/create-admin.js admin password123 Admin User 1234567890
 */

const path = require('path');
const fs = require('fs');

// Try multiple paths for .env file
const envPaths = [
  path.resolve(__dirname, '../.env'),           // backend/.env
  path.resolve(__dirname, '../../backend/.env'), // from scripts folder
  path.resolve(process.cwd(), '.env'),          // current working directory
  path.resolve(process.cwd(), 'backend/.env'),   // backend/.env from root
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`✓ Loaded .env from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

// If no .env found, try default dotenv behavior
if (!envLoaded) {
  require('dotenv').config();
}

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set!');
  console.error('Please create a .env file in the backend directory with:');
  console.error('DATABASE_URL="postgresql://postgres:123456@localhost:5432/gym-db?schema=public"');
  console.error('\nTried looking for .env in:');
  envPaths.forEach(p => console.error(`  - ${p}`));
  process.exit(1);
}

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

