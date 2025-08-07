import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET /api/bets - Fetch betting tips
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const premiumOnly = searchParams.get('premium') === 'true';
    const includeUnpublished = searchParams.get('debug') === 'true';

    // Query real betting tips from database with proper JOINs
    let query = `
      SELECT 
        bt.id, bt.bet_type, bt.recommended_odds, bt.confidence_score, bt.explanation,
        bt.is_premium, bt.published_at, bt.is_published,
        m.match_date, ht.name as home_team, at.name as away_team, l.name as league,
        ta.value_rating, ta.implied_probability, ta.model_probability, ta.risk_factors,
        ta.weather_impact, ta.venue_advantage_percentage, ta.market_movement, ta.betting_volume
      FROM betting_tips bt
      JOIN matches m ON bt.match_id = m.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN leagues l ON m.league_id = l.id
      LEFT JOIN tip_analysis ta ON bt.id = ta.tip_id
      WHERE m.match_date > NOW()
    `;

    if (!includeUnpublished) {
      query += ` AND bt.published_at IS NOT NULL AND bt.is_published = true`;
    }
    
    const queryParams: any[] = [];
    
    if (premiumOnly) {
      query += ` AND bt.is_premium = true`;
    }
    
    query += ` ORDER BY bt.published_at DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit);

    const result = await DatabaseService.query(query, queryParams);
    const bets = result.rows;

    // If no real tips exist, return sample data so the frontend can work properly
    if (bets.length === 0) {
      const sampleBets = [
        {
          id: 'free-1',
          bet_type: 'over_2_5_goals',
          recommended_odds: 2.15,
          confidence_score: 87,
          explanation: 'Both teams have strong attacking records with Manchester City averaging 2.8 goals per game at home and Arsenal scoring in 9 of their last 10 away matches. Expert statistical models indicate high value in this market.',
          is_premium: false,
          published_at: new Date().toISOString(),
          match_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          home_team: 'Manchester City',
          away_team: 'Arsenal', 
          league: 'Premier League',
          value_rating: 8.5,
          implied_probability: 46.5,
          model_probability: 53.8
        },
        {
          id: 'premium-1',
          bet_type: 'btts',
          recommended_odds: 1.85,
          confidence_score: 92,
          explanation: 'Advanced algorithmic analysis reveals significant value. Both teams show defensive vulnerabilities while maintaining strong scoring patterns in recent fixtures.',
          is_premium: true,
          published_at: new Date().toISOString(),
          match_date: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          home_team: 'Liverpool',
          away_team: 'Chelsea',
          league: 'Premier League', 
          value_rating: 9.2,
          implied_probability: 54.1,
          model_probability: 61.3
        },
        {
          id: 'premium-2', 
          bet_type: 'home_win',
          recommended_odds: 1.95,
          confidence_score: 78,
          explanation: 'Quantitative analysis of team form, historical performance, and market inefficiencies indicates strong value proposition for institutional-grade edge.',
          is_premium: true,
          published_at: new Date().toISOString(),
          match_date: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
          home_team: 'Barcelona', 
          away_team: 'Real Madrid',
          league: 'La Liga',
          value_rating: 7.8,
          implied_probability: 51.3,
          model_probability: 58.7
        },
        {
          id: 'premium-3', 
          bet_type: 'under_2_5_goals',
          recommended_odds: 2.05,
          confidence_score: 84,
          explanation: 'Advanced defensive metrics analysis reveals significant market mispricing. Both teams show strong defensive patterns with recent low-scoring encounters creating exceptional value opportunity.',
          is_premium: true,
          published_at: new Date().toISOString(),
          match_date: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
          home_team: 'Atletico Madrid', 
          away_team: 'Sevilla',
          league: 'La Liga',
          value_rating: 8.4,
          implied_probability: 48.8,
          model_probability: 56.2
        }
      ];

      // Filter based on premium parameter if specified
      let filteredBets = sampleBets;
      if (premiumOnly) {
        filteredBets = sampleBets.filter(bet => bet.is_premium);
      }

      return NextResponse.json({
        success: true,
        data: filteredBets.slice(0, limit),
        count: filteredBets.length,
        total: filteredBets.length,
        message: "Sample data - Generate real tips via admin dashboard."
      });
    }

    return NextResponse.json({
      success: true,
      data: bets,
      count: bets.length,
      total: bets.length
    });

  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch betting tips',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/bets - Create new betting tip (for automation system)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['matchId', 'betType', 'recommendedOdds', 'confidenceScore', 'explanation'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate confidence score range
    if (body.confidenceScore < 0 || body.confidenceScore > 100) {
      return NextResponse.json(
        { success: false, error: 'Confidence score must be between 0 and 100' },
        { status: 400 }
      );
    }

    // TODO: Once database is set up, use DatabaseService.createBettingTip
    // For now, return success response
    const tipId = `tip_${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      data: {
        id: tipId,
        ...body,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating betting tip:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create betting tip',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}