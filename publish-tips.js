// Manually publish tips to test the system
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function publishTips() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🚀 Manually publishing tips...');
    
    // Get first 3 unpublished tips
    const unpublishedTips = await pool.query(`
      SELECT id FROM betting_tips 
      WHERE is_published = false OR is_published IS NULL
      ORDER BY created_at DESC
      LIMIT 3
    `);
    
    console.log(`📊 Found ${unpublishedTips.rows.length} unpublished tips to publish`);
    
    for (const tip of unpublishedTips.rows) {
      try {
        const result = await pool.query(`
          UPDATE betting_tips 
          SET is_published = true, published_at = CURRENT_TIMESTAMP 
          WHERE id = $1
          RETURNING id, is_published
        `, [tip.id]);
        
        console.log(`✅ Published tip ${result.rows[0].id}`);
      } catch (error) {
        console.error(`❌ Failed to publish tip ${tip.id}:`, error.message);
      }
    }
    
    // Check final counts
    const finalCounts = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE is_published = true) as published,
        COUNT(*) FILTER (WHERE is_published = false OR is_published IS NULL) as unpublished,
        COUNT(*) as total
      FROM betting_tips
    `);
    
    console.log('\n📊 Final tip counts:');
    console.log(`  - Published: ${finalCounts.rows[0].published}`);
    console.log(`  - Unpublished: ${finalCounts.rows[0].unpublished}`);
    console.log(`  - Total: ${finalCounts.rows[0].total}`);

  } catch (error) {
    console.error('❌ Error publishing tips:', error);
  } finally {
    await pool.end();
  }
}

publishTips();