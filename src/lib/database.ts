import { Pool } from 'pg';

// Database configuration (Supabase compatible)
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 10, // Supabase recommends lower connection pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Increased for cloud connections
};

// Create connection pool
export const db = new Pool(dbConfig);

// Test database connection (Supabase optimized)
export async function testConnection() {
  try {
    const client = await db.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as database_version');
    client.release();
    console.log('✅ Database connected successfully:', {
      time: result.rows[0].current_time,
      isSupabase: result.rows[0].database_version.includes('PostgreSQL')
    });
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (error.message?.includes('password')) {
      console.error('💡 Check your DATABASE_URL and ensure password is correct');
    }
    if (error.message?.includes('ENOTFOUND') || error.message?.includes('timeout')) {
      console.error('💡 Check your internet connection and database host');
    }
    return false;
  }
}

// Database helper functions
export class DatabaseService {
  // Generic query executor
  static async query(text: string, params?: any[]) {
    const client = await db.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Get betting tips with analysis
  static async getBettingTips(limit: number = 10, premiumOnly: boolean = false) {
    const query = `
      SELECT 
        bt.id,
        bt.bet_type,
        bt.recommended_odds,
        bt.confidence_score,
        bt.explanation,
        bt.is_premium,
        bt.published_at,
        m.match_date,
        ht.name as home_team,
        at.name as away_team,
        l.name as league,
        ta.value_rating,
        ta.implied_probability,
        ta.model_probability,
        ta.risk_factors,
        ta.weather_impact,
        ta.venue_advantage_percentage,
        ta.market_movement,
        ta.betting_volume
      FROM betting_tips bt
      JOIN matches m ON bt.match_id = m.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN leagues l ON m.league_id = l.id
      LEFT JOIN tip_analysis ta ON bt.id = ta.tip_id
      WHERE bt.is_published = true
      ${premiumOnly ? 'AND bt.is_premium = true' : ''}
      ORDER BY bt.published_at DESC
      LIMIT $1
    `;
    
    const result = await this.query(query, [limit]);
    return result.rows;
  }

  // Get match with team stats and head-to-head
  static async getMatchAnalysis(matchId: string) {
    const query = `
      SELECT 
        m.*,
        ht.name as home_team,
        at.name as away_team,
        l.name as league,
        hts.current_form as home_form,
        hts.wins as home_wins,
        hts.draws as home_draws,
        hts.losses as home_losses,
        hts.goals_for as home_goals_for,
        hts.goals_against as home_goals_against,
        ats.current_form as away_form,
        ats.wins as away_wins,
        ats.draws as away_draws,
        ats.losses as away_losses,
        ats.goals_for as away_goals_for,
        ats.goals_against as away_goals_against,
        h2h.total_meetings,
        h2h.home_wins as h2h_home_wins,
        h2h.away_wins as h2h_away_wins,
        h2h.draws as h2h_draws,
        h2h.last_meeting_date,
        h2h.last_meeting_score
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN leagues l ON m.league_id = l.id
      LEFT JOIN team_stats hts ON ht.id = hts.team_id
      LEFT JOIN team_stats ats ON at.id = ats.team_id
      LEFT JOIN head_to_head h2h ON (m.home_team_id = h2h.home_team_id AND m.away_team_id = h2h.away_team_id)
      WHERE m.id = $1
    `;
    
    const result = await this.query(query, [matchId]);
    return result.rows[0];
  }

  // Get team players with current status
  static async getTeamPlayers(teamId: string) {
    const query = `
      SELECT 
        p.*,
        ps.status,
        ps.importance,
        ps.reason,
        ps.expected_return_date
      FROM players p
      LEFT JOIN player_status ps ON p.id = ps.player_id
      WHERE p.team_id = $1
      AND (ps.start_date IS NULL OR ps.start_date <= CURRENT_TIMESTAMP)
      AND (ps.expected_return_date IS NULL OR ps.expected_return_date >= CURRENT_TIMESTAMP)
      ORDER BY ps.importance DESC NULLS LAST, p.jersey_number
    `;
    
    const result = await this.query(query, [teamId]);
    return result.rows;
  }

  // Get current betting odds for a match
  static async getBettingOdds(matchId: string, betType?: string) {
    const query = `
      SELECT 
        bookmaker,
        bet_type,
        odds,
        timestamp,
        ROW_NUMBER() OVER (PARTITION BY bookmaker, bet_type ORDER BY timestamp DESC) as rn
      FROM betting_odds
      WHERE match_id = $1
      ${betType ? 'AND bet_type = $2' : ''}
    `;
    
    const params = betType ? [matchId, betType] : [matchId];
    const result = await this.query(query + ' AND rn = 1', params);
    return result.rows;
  }

  // Create new betting tip
  static async createBettingTip(tipData: {
    matchId: string;
    betType: string;
    recommendedOdds: number;
    confidenceScore: number;
    explanation: string;
    isPremium: boolean;
    analysisData?: any;
  }) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert betting tip
      const tipQuery = `
        INSERT INTO betting_tips (match_id, bet_type, recommended_odds, confidence_score, explanation, is_premium)
        VALUES ($1, $2, $3, $4, $5, $6)
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
      }
      
      await client.query('COMMIT');
      return tipId;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update team statistics
  static async updateTeamStats(teamId: string, season: string, stats: any) {
    const query = `
      INSERT INTO team_stats (
        team_id, season, matches_played, wins, draws, losses,
        goals_for, goals_against, home_wins, home_draws, home_losses,
        away_wins, away_draws, away_losses, current_form
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (team_id, season) 
      DO UPDATE SET
        matches_played = EXCLUDED.matches_played,
        wins = EXCLUDED.wins,
        draws = EXCLUDED.draws,
        losses = EXCLUDED.losses,
        goals_for = EXCLUDED.goals_for,
        goals_against = EXCLUDED.goals_against,
        home_wins = EXCLUDED.home_wins,
        home_draws = EXCLUDED.home_draws,
        home_losses = EXCLUDED.home_losses,
        away_wins = EXCLUDED.away_wins,
        away_draws = EXCLUDED.away_draws,
        away_losses = EXCLUDED.away_losses,
        current_form = EXCLUDED.current_form,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await this.query(query, [
      teamId, season, stats.matchesPlayed, stats.wins, stats.draws, stats.losses,
      stats.goalsFor, stats.goalsAgainst, stats.homeWins, stats.homeDraws, stats.homeLosses,
      stats.awayWins, stats.awayDraws, stats.awayLosses, stats.currentForm
    ]);
  }

  // Log API usage for monitoring
  static async logApiUsage(provider: string, endpoint: string, cost: number = 0) {
    const query = `
      INSERT INTO api_usage (api_provider, endpoint, cost_estimate)
      VALUES ($1, $2, $3)
      ON CONFLICT (api_provider, endpoint, date)
      DO UPDATE SET
        requests_made = api_usage.requests_made + 1,
        cost_estimate = api_usage.cost_estimate + EXCLUDED.cost_estimate
    `;
    
    await this.query(query, [provider, endpoint, cost]);
  }

  // Get system configuration
  static async getConfig(key: string): Promise<string | null> {
    const query = 'SELECT value FROM system_config WHERE key = $1';
    const result = await this.query(query, [key]);
    return result.rows[0]?.value || null;
  }

  // Set system configuration
  static async setConfig(key: string, value: string, description?: string) {
    const query = `
      INSERT INTO system_config (key, value, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (key)
      DO UPDATE SET
        value = EXCLUDED.value,
        description = COALESCE(EXCLUDED.description, system_config.description),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await this.query(query, [key, value, description]);
  }
}

// Initialize database connection on startup
export async function initializeDatabase() {
  const connected = await testConnection();
  if (!connected) {
    throw new Error('Failed to connect to database');
  }
  
  console.log('Database service initialized');
  return true;
}