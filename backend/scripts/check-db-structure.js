/**
 * Script to check database structure
 */

const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function checkDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    
    // Check if admins table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'admins'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ admins table does NOT exist');
      return;
    }
    
    console.log('✅ admins table exists\n');
    
    // Get column names
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'admins'
      ORDER BY ordinal_position
    `);
    
    console.log('Columns in admins table:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check for adminID vs adminid
    const adminIDCol = columns.rows.find(c => c.column_name.toLowerCase() === 'adminid');
    if (adminIDCol) {
      console.log(`\n📌 Found: column is named "${adminIDCol.column_name}"`);
      if (adminIDCol.column_name !== 'adminID') {
        console.log(`⚠️  Column name is "${adminIDCol.column_name}" but Prisma expects "adminID"`);
        console.log('   This is the issue! PostgreSQL converts unquoted identifiers to lowercase.');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDB();

