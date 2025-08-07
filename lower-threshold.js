// Lower confidence threshold to see if tips start getting published
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function lowerThreshold() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('⚙️ Lowering confidence threshold for testing...');
    
    // Lower threshold from 65% to 50% temporarily  
    await pool.query(`
      UPDATE system_config 
      SET value = '50' 
      WHERE key = 'min_confidence_threshold'
    `);

    console.log('✅ Confidence threshold lowered to 50%');
    
    const config = await pool.query(`
      SELECT key, value FROM system_config 
      WHERE key = 'min_confidence_threshold'
    `);
    
    console.log('📋 Current threshold:', config.rows[0]);

  } catch (error) {
    console.error('❌ Error lowering threshold:', error);
  } finally {
    await pool.end();
  }
}

lowerThreshold();