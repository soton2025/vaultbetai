const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function showAutomationStatus() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🤖 Vault Bets Automation System Status');
    console.log('=====================================\n');
    
    // Get configuration
    const config = await pool.query('SELECT key, value, description FROM system_config ORDER BY key');
    
    console.log('📋 System Configuration:');
    console.log('------------------------');
    
    const dailyTime = config.rows.find(row => row.key === 'DAILY_GENERATION_TIME');
    const autoGen = config.rows.find(row => row.key === 'AUTO_GENERATION_ENABLED');
    const autoPublish = config.rows.find(row => row.key === 'AUTO_PUBLISH_ENABLED');
    const maxTips = config.rows.find(row => row.key === 'max_tips_per_day');
    const minConfidence = config.rows.find(row => row.key === 'min_confidence_threshold');
    
    console.log(`🕐 Daily Generation Time: ${dailyTime?.value || 'Not set'} (${dailyTime?.description || 'N/A'})`);
    console.log(`🔄 Auto Generation: ${autoGen?.value === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`📢 Auto Publishing: ${autoPublish?.value === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`📊 Max Tips Per Day: ${maxTips?.value || 'Not set'}`);
    console.log(`🎯 Min Confidence: ${minConfidence?.value || 'Not set'}%`);
    
    // Show next scheduled run
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(9, 0, 0, 0); // 9:00 AM
    
    // If it's already past 9:00 AM today, show tomorrow
    if (now.getHours() >= 9) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    console.log(`\n📅 Next Scheduled Run: ${nextRun.toLocaleString('en-GB', { 
      timeZone: 'Europe/London',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`);
    
    // Show recent activity
    const recentLogs = await pool.query(`
      SELECT analysis_type, status, created_at, execution_time_ms, error_message
      FROM analysis_logs 
      WHERE analysis_type LIKE '%GENERATION%' OR analysis_type LIKE '%SCHEDULED%'
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (recentLogs.rows.length > 0) {
      console.log('\n📊 Recent Activity:');
      console.log('------------------');
      recentLogs.rows.forEach(log => {
        const status = log.status === 'success' ? '✅' : '❌';
        const time = new Date(log.created_at).toLocaleString('en-GB', { 
          timeZone: 'Europe/London',
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        });
        console.log(`${status} ${time} - ${log.analysis_type} (${log.status})`);
        if (log.error_message && log.error_message !== 'Job: N/A') {
          console.log(`   Error: ${log.error_message}`);
        }
      });
    }
    
    // Show last generation stats
    const lastGenDate = config.rows.find(row => row.key === 'LAST_GENERATION_DATE');
    const lastGenPublished = config.rows.find(row => row.key === 'LAST_GENERATION_PUBLISHED');
    const lastGenTotal = config.rows.find(row => row.key === 'LAST_GENERATION_TOTAL');
    
    if (lastGenDate) {
      console.log('\n📈 Last Generation Stats:');
      console.log('-------------------------');
      console.log(`📅 Date: ${lastGenDate.value}`);
      console.log(`📢 Published: ${lastGenPublished?.value || '0'} tips`);
      console.log(`📊 Total Generated: ${lastGenTotal?.value || '0'} tips`);
    }
    
    console.log('\n🔄 Manual Testing Commands:');
    console.log('---------------------------');
    console.log('1. Test daily generation:');
    console.log('   curl -X POST http://localhost:3000/api/admin/automation \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"action": "trigger_daily_generation"}\'');
    console.log('');
    console.log('2. Check scheduler status:');
    console.log('   curl -X GET http://localhost:3000/api/admin/automation');
    console.log('');
    console.log('3. Initialize scheduler:');
    console.log('   curl -X POST http://localhost:3000/api/admin/automation \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"action": "initialize_scheduler"}\'');
    
    console.log('\n✅ Automation system is configured for 9:00 AM UK time daily generation!');
    console.log('💡 Restart your application to activate the scheduler.');
    
  } catch (error) {
    console.error('❌ Error checking automation status:', error);
  } finally {
    await pool.end();
  }
}

showAutomationStatus();
