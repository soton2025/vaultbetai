// Check database contents
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔍 Checking betting_tips table...');
    const tips = await pool.query('SELECT COUNT(*) as count FROM betting_tips');
    console.log(`📊 Total betting_tips: ${tips.rows[0].count}`);

    if (tips.rows[0].count > 0) {
      const recentTips = await pool.query('SELECT id, bet_type, confidence_score, is_published, created_at FROM betting_tips ORDER BY created_at DESC LIMIT 5');
      console.log('🎯 Recent tips:');
      recentTips.rows.forEach(tip => {
        console.log(`  - ID: ${tip.id}, Type: ${tip.bet_type}, Confidence: ${tip.confidence_score}%, Published: ${tip.is_published}, Created: ${tip.created_at}`);
      });
    }

    console.log('\n🔍 Checking matches table...');
    const matches = await pool.query('SELECT COUNT(*) as count FROM matches');
    console.log(`📊 Total matches: ${matches.rows[0].count}`);

    console.log('\n🔍 Checking teams table...');
    const teams = await pool.query('SELECT COUNT(*) as count FROM teams');
    console.log(`📊 Total teams: ${teams.rows[0].count}`);

    console.log('\n🔍 Checking leagues table...');
    const leagues = await pool.query('SELECT COUNT(*) as count FROM leagues');
    console.log(`📊 Total leagues: ${leagues.rows[0].count}`);

    console.log('\n🔍 Checking analysis_logs table...');
    const logs = await pool.query('SELECT analysis_type, status, error_message, created_at FROM analysis_logs ORDER BY created_at DESC LIMIT 10');
    console.log('📝 Recent logs:');
    logs.rows.forEach(log => {
      console.log(`  - ${log.analysis_type}: ${log.status} - ${log.error_message || 'No error'} (${log.created_at})`);
    });

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();