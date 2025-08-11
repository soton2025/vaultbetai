const { Pool } = require('pg');

async function updateDailyTime() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🕐 Updating daily tip generation time to 9:00 AM UK time...');
    
    // Update the daily generation time to 9:00 AM UK time
    // Since UK is UTC+0 (GMT) or UTC+1 (BST), we'll use 9:00 AM UTC
    // This ensures it runs at 9:00 AM UK time year-round
    await pool.query(`
      INSERT INTO system_config (key, value, description)
      VALUES ('DAILY_GENERATION_TIME', '09:00', 'Time to generate daily tips (HH:00 format) - 9:00 AM UK time')
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
    `);

    // Also update the legacy key for backward compatibility
    await pool.query(`
      INSERT INTO system_config (key, value, description)
      VALUES ('daily_tip_generation_time', '09:00', 'Time to generate daily tips (HH:MM format) - 9:00 AM UK time')
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
    `);

    // Ensure auto-generation is enabled
    await pool.query(`
      INSERT INTO system_config (key, value, description)
      VALUES ('AUTO_GENERATION_ENABLED', 'true', 'Enable automatic tip generation')
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `);

    // Ensure auto-publishing is enabled
    await pool.query(`
      INSERT INTO system_config (key, value, description)
      VALUES ('AUTO_PUBLISH_ENABLED', 'true', 'Enable automatic tip publishing')
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `);

    console.log('✅ Daily generation time updated successfully');
    
    // Show current configuration
    const config = await pool.query(`
      SELECT key, value, description FROM system_config 
      WHERE key LIKE '%TIME%' OR key LIKE '%GENERATION%' OR key LIKE '%PUBLISH%'
      ORDER BY key
    `);
    
    console.log('\n📋 Current automation configuration:');
    config.rows.forEach(row => {
      console.log(`  - ${row.key}: ${row.value} (${row.description})`);
    });

    console.log('\n🔄 Next steps:');
    console.log('  1. Restart your application to pick up the new configuration');
    console.log('  2. The scheduler will automatically run daily at 9:00 AM UK time');
    console.log('  3. You can manually trigger generation using the admin API');
    console.log('  4. Check the logs to confirm the scheduler is running');

  } catch (error) {
    console.error('❌ Error updating daily time:', error);
  } finally {
    await pool.end();
  }
}

// Run the update
updateDailyTime().catch(console.error);
