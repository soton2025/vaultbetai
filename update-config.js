// Update system configuration for better match discovery
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function updateConfig() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('⚙️ Updating system configuration...');
    
    // Update to look ahead 7 days instead of 3 to catch weekend matches
    await pool.query(`
      INSERT INTO system_config (key, value, description)
      VALUES ('analysis_lookback_days', '7', 'Days of upcoming matches to analyze')
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `);

    // Also enable auto-publishing so tips show up
    await pool.query(`
      INSERT INTO system_config (key, value, description)
      VALUES ('auto_publish_enabled', 'true', 'Enable automatic tip publishing')
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `);

    console.log('✅ Configuration updated successfully');
    
    const config = await pool.query(`
      SELECT key, value FROM system_config 
      WHERE key LIKE '%days%' OR key LIKE '%publish%'
    `);
    
    console.log('\n📋 Updated configuration:');
    config.rows.forEach(row => {
      console.log(`  - ${row.key}: ${row.value}`);
    });

  } catch (error) {
    console.error('❌ Error updating config:', error);
  } finally {
    await pool.end();
  }
}

updateConfig();