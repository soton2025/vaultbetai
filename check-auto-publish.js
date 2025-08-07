// Check auto-publish configuration
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkAutoPublish() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('⚙️ Checking auto-publish configuration...');
    
    const config = await pool.query(`
      SELECT key, value FROM system_config 
      WHERE key LIKE '%publish%' OR key = 'auto_publish_enabled'
    `);
    
    console.log('📋 Publish-related config:');
    config.rows.forEach(row => {
      console.log(`  - ${row.key}: ${row.value}`);
    });
    
    // Check if any tips exist with is_published = true
    const publishedTips = await pool.query(`
      SELECT COUNT(*) as published_count 
      FROM betting_tips 
      WHERE is_published = true
    `);
    
    const unpublishedTips = await pool.query(`
      SELECT COUNT(*) as unpublished_count 
      FROM betting_tips 
      WHERE is_published = false OR is_published IS NULL
    `);
    
    console.log('\n📊 Database tip counts:');
    console.log(`  - Published tips: ${publishedTips.rows[0].published_count}`);
    console.log(`  - Unpublished tips: ${unpublishedTips.rows[0].unpublished_count}`);
    
    // Manually publish a few tips for testing
    console.log('\n🚀 Manually publishing first 3 tips...');
    
    const publishResult = await pool.query(`
      UPDATE betting_tips 
      SET is_published = true, published_at = CURRENT_TIMESTAMP 
      WHERE is_published = false 
      LIMIT 3
      RETURNING id, is_published
    `);
    
    console.log(`✅ Manually published ${publishResult.rows.length} tips`);
    publishResult.rows.forEach(tip => {
      console.log(`  - Tip ${tip.id}: published = ${tip.is_published}`);
    });

  } catch (error) {
    console.error('❌ Error checking auto-publish:', error);
  } finally {
    await pool.end();
  }
}

checkAutoPublish();