/**
 * Script to initialize the database using Init.sql
 * Usage: node scripts/init-database.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function initDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set!');
      console.error('Please check your .env file in the backend directory.');
      process.exit(1);
    }

    const initSqlPath = path.resolve(__dirname, '../../Init.sql');
    
    if (!fs.existsSync(initSqlPath)) {
      console.error('❌ Init.sql file not found at:', initSqlPath);
      process.exit(1);
    }

    console.log('📖 Reading Init.sql file...');
    let sql = fs.readFileSync(initSqlPath, 'utf8');
    
    // Remove BOM (Byte Order Mark) if present
    if (sql.charCodeAt(0) === 0xFEFF) {
      sql = sql.slice(1);
    }

    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('🔄 Executing database initialization script...');
    console.log('⏳ This may take a few moments...\n');

    // Execute the SQL script
    await client.query(sql);

    console.log('\n✅ Database initialized successfully!');
    console.log('📋 All tables, indexes, and constraints have been created.\n');
    
    console.log('💡 Next step: Create an admin user by running:');
    console.log('   node scripts/create-admin.js admin password123 Admin User 1234567890\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n💡 Some objects may already exist. This is normal if you\'ve run this before.');
      console.log('   The script uses IF NOT EXISTS, so it should be safe to run multiple times.\n');
    } else if (error.message.includes('permission denied') || error.message.includes('permission')) {
      console.log('\n💡 Permission error. Make sure:');
      console.log('   1. Your database user has CREATE privileges');
      console.log('   2. The DATABASE_URL in .env is correct\n');
    } else if (error.message.includes('does not exist')) {
      console.log('\n💡 Database does not exist. Create it first:');
      console.log('   psql -U postgres -c "CREATE DATABASE \\"gym-db\\";"\n');
    } else {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure PostgreSQL is running');
      console.log('   2. Check that DATABASE_URL in .env is correct');
      console.log('   3. Verify the database exists\n');
      console.log('Full error:', error);
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();

