/**
 * Script to check memberships table columns
 */

const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function checkColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'memberships'
      ORDER BY ordinal_position
    `);
    
    console.log('Columns in memberships table:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check for RemainSessions
    const sessionCol = columns.rows.find(c => c.column_name.toLowerCase().includes('session'));
    if (sessionCol) {
      console.log(`\n📌 Session column is named: "${sessionCol.column_name}"`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkColumns();

