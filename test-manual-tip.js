// Test manual tip creation to isolate the database issue
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function testManualTip() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🧪 Testing manual tip creation...');
    
    // Get a real match from database
    const match = await pool.query(`
      SELECT m.id as match_id, ht.name as home_team, at.name as away_team 
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      LIMIT 1
    `);
    
    if (match.rows.length === 0) {
      console.log('❌ No matches found');
      return;
    }
    
    const testMatch = match.rows[0];
    console.log(`📊 Using match: ${testMatch.home_team} vs ${testMatch.away_team}`);
    
    // Create a tip exactly like the automation system would
    const tipData = {
      matchId: testMatch.match_id,
      betType: 'home_win',
      recommendedOdds: 2.5,
      confidenceScore: 75,
      explanation: 'Test tip - home team has strong recent form',
      isPremium: false,
      analysisData: {
        valueRating: 7,
        impliedProbability: 40,
        modelProbability: 75,
        riskFactors: ['opponent_away_form'],
        weatherImpact: 'neutral',
        venueAdvantagePercentage: 65,
        marketMovement: 'stable',
        bettingVolume: 'medium'
      }
    };
    
    // Test the DatabaseService.createBettingTip method
    console.log('🔍 Testing DatabaseService.createBettingTip...');
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert betting tip
      const tipQuery = `
        INSERT INTO betting_tips (match_id, bet_type, recommended_odds, confidence_score, explanation, is_premium, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        RETURNING id
      `;
      
      const tipResult = await client.query(tipQuery, [
        tipData.matchId,
        tipData.betType,
        tipData.recommendedOdds,
        tipData.confidenceScore,
        tipData.explanation,
        tipData.isPremium
      ]);
      
      const tipId = tipResult.rows[0].id;
      console.log(`✅ Tip created successfully! ID: ${tipId}`);
      
      // Insert analysis data if provided
      if (tipData.analysisData) {
        const analysisQuery = `
          INSERT INTO tip_analysis (
            tip_id, value_rating, implied_probability, model_probability,
            risk_factors, weather_impact, venue_advantage_percentage,
            market_movement, betting_volume
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        
        await client.query(analysisQuery, [
          tipId,
          tipData.analysisData.valueRating,
          tipData.analysisData.impliedProbability,
          tipData.analysisData.modelProbability,
          tipData.analysisData.riskFactors,
          tipData.analysisData.weatherImpact,
          tipData.analysisData.venueAdvantagePercentage,
          tipData.analysisData.marketMovement,
          tipData.analysisData.bettingVolume
        ]);
        
        console.log('✅ Analysis data inserted successfully!');
      }
      
      await client.query('COMMIT');
      console.log('✅ Transaction committed successfully!');
      
      // Now check if we can fetch it via API
      console.log('\n🔍 Testing API retrieval...');
      
      const tipCheck = await pool.query(`
        SELECT 
          bt.id, bt.bet_type, bt.confidence_score, bt.is_published,
          ht.name as home_team, at.name as away_team
        FROM betting_tips bt
        JOIN matches m ON bt.match_id = m.id
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
        WHERE bt.id = $1
      `, [tipId]);
      
      if (tipCheck.rows.length > 0) {
        const tip = tipCheck.rows[0];
        console.log(`✅ Tip found in database: ${tip.home_team} vs ${tip.away_team}, ${tip.bet_type}, ${tip.confidence_score}%, Published: ${tip.is_published}`);
        
        // Clean up
        await pool.query('DELETE FROM tip_analysis WHERE tip_id = $1', [tipId]);
        await pool.query('DELETE FROM betting_tips WHERE id = $1', [tipId]);
        console.log('🗑️ Test tip cleaned up');
      }
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Database error:', error.message);
      console.error('   Details:', error.detail || 'No additional details');
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testManualTip();