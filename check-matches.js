// Check match dates
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkMatches() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('📅 Checking match dates...');
    console.log('🕐 Current time:', new Date().toISOString());
    
    const matches = await pool.query(`
      SELECT api_id, match_date, venue, status, created_at 
      FROM matches 
      ORDER BY match_date ASC
    `);
    
    console.log(`📊 Found ${matches.rows.length} matches:`);
    matches.rows.forEach(match => {
      const matchDate = new Date(match.match_date);
      const now = new Date();
      const hoursFromNow = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      console.log(`  - Match ${match.api_id}: ${matchDate.toISOString()} (${Math.round(hoursFromNow)} hours from now)`);
    });

    // Check what the current system configuration is
    const config = await pool.query(`
      SELECT key, value FROM system_config 
      WHERE key IN ('analysis_lookback_days', 'max_tips_per_day', 'min_confidence_threshold')
    `);
    
    console.log('\n⚙️ Current system config:');
    config.rows.forEach(row => {
      console.log(`  - ${row.key}: ${row.value}`);
    });

  } catch (error) {
    console.error('❌ Error checking matches:', error);
  } finally {
    await pool.end();
  }
}

checkMatches();