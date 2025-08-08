const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testScheduler() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🧪 Testing scheduler configuration...');
    
    // Check current configuration
    const config = await pool.query(`
      SELECT key, value, description FROM system_config 
      ORDER BY key
    `);
    
    console.log('\n📋 Current scheduler configuration:');
    config.rows.forEach(row => {
      console.log(`  - ${row.key}: ${row.value} (${row.description})`);
    });

    // Check if scheduler is properly configured for 9:00 AM
    const dailyTime = config.rows.find(row => row.key === 'daily_tip_generation_time');
    
    if (dailyTime && dailyTime.value === '09:00') {
      console.log('\n✅ Daily generation time is correctly set to 9:00 AM UK time');
    } else {
      console.log('\n❌ Daily generation time is NOT set to 9:00 AM');
      console.log('   Current value:', dailyTime ? dailyTime.value : 'not found');
    }

    // Check if auto-generation is enabled
    const autoGen = config.rows.find(row => row.key === 'AUTO_GENERATION_ENABLED');
    if (autoGen && autoGen.value === 'true') {
      console.log('✅ Auto-generation is enabled');
    } else {
      console.log('❌ Auto-generation is disabled');
    }

    // Check if auto-publishing is enabled
    const autoPublish = config.rows.find(row => row.key === 'auto_publish_enabled');
    if (autoPublish && autoPublish.value === 'true') {
      console.log('✅ Auto-publishing is enabled');
    } else {
      console.log('❌ Auto-publishing is disabled');
    }

    // Show next scheduled run time
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(9, 0, 0, 0); // 9:00 AM
    
    // If it's already past 9:00 AM today, show tomorrow
    if (now.getHours() >= 9) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    console.log(`\n📅 Next scheduled run: ${nextRun.toLocaleString('en-GB', { 
      timeZone: 'Europe/London',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`);

    // Check recent generation logs
    const recentLogs = await pool.query(`
      SELECT analysis_type, status, created_at, execution_time_ms, error_message
      FROM analysis_logs 
      WHERE analysis_type LIKE '%GENERATION%' OR analysis_type LIKE '%SCHEDULED%'
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    if (recentLogs.rows.length > 0) {
      console.log('\n📊 Recent generation activity:');
      recentLogs.rows.forEach(log => {
        const status = log.status === 'success' ? '✅' : '❌';
        const time = new Date(log.created_at).toLocaleString('en-GB', { 
          timeZone: 'Europe/London',
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        });
        console.log(`  ${status} ${time} - ${log.analysis_type} (${log.status})`);
        if (log.error_message) {
          console.log(`    Error: ${log.error_message}`);
        }
      });
    } else {
      console.log('\n📊 No recent generation activity found');
    }

    console.log('\n🔄 To test the automation manually:');
    console.log('  1. Use the admin API: POST /api/admin/automation');
    console.log('     Body: { "action": "trigger_daily_generation" }');
    console.log('  2. Or restart your app to initialize the scheduler');
    console.log('  3. Check logs for scheduler initialization messages');

  } catch (error) {
    console.error('❌ Error testing scheduler:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testScheduler().catch(console.error);
