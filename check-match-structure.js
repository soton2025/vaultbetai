// Check the structure of match data being passed to analysis
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkMatchStructure() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔍 Checking match data structure...\n');
    
    // Get a sample match with all its data
    const matchQuery = `
      SELECT 
        m.id, m.api_id, m.match_date, m.venue,
        m.home_team_id, m.away_team_id, m.league_id,
        ht.name as home_team, at.name as away_team, l.name as league
      FROM matches m
      LEFT JOIN teams ht ON m.home_team_id = ht.id
      LEFT JOIN teams at ON m.away_team_id = at.id
      LEFT JOIN leagues l ON m.league_id = l.id
      ORDER BY m.created_at DESC
      LIMIT 1
    `;
    
    const match = await pool.query(matchQuery);
    
    if (match.rows.length > 0) {
      const matchData = match.rows[0];
      
      console.log('📊 Sample match from database:');
      console.log(`  Match ID: ${matchData.id}`);
      console.log(`  API ID: ${matchData.api_id}`);
      console.log(`  Home Team: ${matchData.home_team} (ID: ${matchData.home_team_id})`);
      console.log(`  Away Team: ${matchData.away_team} (ID: ${matchData.away_team_id})`);
      console.log(`  League: ${matchData.league} (ID: ${matchData.league_id})`);
      console.log(`  Date: ${matchData.match_date}`);
      console.log(`  Venue: ${matchData.venue}`);
      
      // Check what the automation pipeline needs vs what we have
      console.log('\n🔍 Analysis Engine expectations vs reality:');
      console.log('  AnalysisEngine.analyzeMatch() expects:');
      console.log('    - matchData.homeTeamId ❓');
      console.log('    - matchData.awayTeamId ❓');
      console.log('    - matchData.venue.city ❓');
      
      console.log('\n  Match data actually has:');
      console.log(`    - home_team_id: ${matchData.home_team_id} ✅`);
      console.log(`    - away_team_id: ${matchData.away_team_id} ✅`);
      console.log(`    - venue: ${matchData.venue} (string, not object) ⚠️`);
      
    } else {
      console.log('❌ No matches found in database');
    }

  } catch (error) {
    console.error('❌ Error checking match structure:', error);
  } finally {
    await pool.end();
  }
}

checkMatchStructure();