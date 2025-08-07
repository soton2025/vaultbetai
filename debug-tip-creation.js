// Debug tip creation to see what's failing
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function debugTipCreation() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔍 Debugging tip creation process...\n');
    
    // Check if we have any betting_tips at all (even unpublished)
    const allTips = await pool.query('SELECT COUNT(*) as count FROM betting_tips');
    console.log(`📊 Total betting_tips (including unpublished): ${allTips.rows[0].count}`);
    
    if (allTips.rows[0].count > 0) {
      const tipDetails = await pool.query(`
        SELECT id, match_id, bet_type, confidence_score, is_published, created_at 
        FROM betting_tips 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      console.log('🎯 Recent tips:');
      tipDetails.rows.forEach(tip => {
        console.log(`  - ID: ${tip.id}, Match: ${tip.match_id}, Type: ${tip.bet_type}, Confidence: ${tip.confidence_score}%, Published: ${tip.is_published}`);
      });
    } else {
      console.log('❌ No betting_tips found in database at all');
    }
    
    // Check matches and see if they have proper relationships
    console.log('\n🏈 Recent matches with team relationships:');
    const matchDetails = await pool.query(`
      SELECT 
        m.id, m.api_id, m.match_date,
        ht.name as home_team, at.name as away_team, l.name as league
      FROM matches m
      LEFT JOIN teams ht ON m.home_team_id = ht.id
      LEFT JOIN teams at ON m.away_team_id = at.id
      LEFT JOIN leagues l ON m.league_id = l.id
      ORDER BY m.created_at DESC
      LIMIT 5
    `);
    
    matchDetails.rows.forEach((match, index) => {
      console.log(`  ${index + 1}. ${match.home_team || 'NULL'} vs ${match.away_team || 'NULL'}`);
      console.log(`     League: ${match.league || 'NULL'}, Match ID: ${match.id}`);
      console.log(`     Date: ${match.match_date}`);
    });
    
    // Check for any error logs that might explain tip creation failures
    console.log('\n📝 Recent error logs:');
    const errorLogs = await pool.query(`
      SELECT analysis_type, status, error_message, created_at
      FROM analysis_logs 
      WHERE status = 'failed' OR error_message IS NOT NULL
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    if (errorLogs.rows.length > 0) {
      errorLogs.rows.forEach(log => {
        console.log(`  - ${log.analysis_type}: ${log.status} - ${log.error_message}`);
      });
    } else {
      console.log('  ✅ No error logs found');
    }
    
    // Test a simple tip creation to see what fails
    console.log('\n🧪 Testing tip creation manually...');
    
    const testMatch = matchDetails.rows[0];
    if (testMatch && testMatch.id) {
      try {
        const testTipResult = await pool.query(`
          INSERT INTO betting_tips (match_id, bet_type, recommended_odds, confidence_score, explanation, is_premium, is_published)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [
          testMatch.id,
          'home_win',
          2.5,
          75,
          'Test tip for debugging purposes',
          false,
          true
        ]);
        
        console.log(`✅ Manual tip creation successful! Tip ID: ${testTipResult.rows[0].id}`);
        
        // Clean up test tip
        await pool.query('DELETE FROM betting_tips WHERE id = $1', [testTipResult.rows[0].id]);
        console.log('🗑️ Test tip cleaned up');
        
      } catch (testError) {
        console.log(`❌ Manual tip creation failed: ${testError.message}`);
        console.log(`   Details: ${testError.detail || 'No additional details'}`);
      }
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error);
  } finally {
    await pool.end();
  }
}

debugTipCreation();