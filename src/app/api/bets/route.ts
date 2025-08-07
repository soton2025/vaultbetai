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

    // TEMPORARY: Force sample data until real tips are generated
    // TODO: Remove this when automation pipeline is working
    const bets: any[] = []; // Force empty to always use sample data
    
    // Always return sample data for now to ensure consistent experience
    if (bets.length === 0) {
      const sampleBets = [
        {
          id: 'free-1',
          bet_type: 'over_1_5_goals',
          recommended_odds: 1.75,
          confidence_score: 89,
          explanation: 'Crystal Palace\'s first-ever Community Shield appearance brings attacking ambition against Premier League champions Liverpool. Liverpool scored in all pre-season fixtures, while Palace will attack at Wembley seeking historic glory.',
          is_premium: false,
          published_at: new Date().toISOString(),
          match_date: '2025-08-10T15:00:00Z', // Community Shield kick-off
          home_team: 'Crystal Palace',
          away_team: 'Liverpool', 
          league: 'FA Community Shield',
          value_rating: 8.9,
          implied_probability: 57.1,
          model_probability: 67.3
        },
        {
          id: 'premium-1',
          bet_type: 'btts',
          recommended_odds: 1.90,
          confidence_score: 85,
          explanation: 'Aston Villa\'s attacking pre-season form meets Villarreal\'s possession-based approach. Villa scored 12 goals in 4 friendlies, while Villarreal\'s technical style creates chances. Both teams prioritize attacking football in final preparations.',
          is_premium: true,
          published_at: new Date().toISOString(),
          match_date: '2025-08-10T20:00:00Z', // Estadio de la Ceramica kick-off
          home_team: 'Aston Villa',
          away_team: 'Villarreal',
          league: 'Club Friendly', 
          value_rating: 8.5,
          implied_probability: 52.6,
          model_probability: 63.2
        },
        {
          id: 'premium-2', 
          bet_type: 'arsenal_handicap_minus_1',
          recommended_odds: 2.10,
          confidence_score: 82,
          explanation: 'Arsenal\'s Emirates home advantage in final pre-season preparation meets Athletic Club\'s physical approach. Arsenal\'s squad depth and home crowd create significant edge for convincing victory in Emirates Cup finale.',
          is_premium: true,
          published_at: new Date().toISOString(),
          match_date: '2025-08-09T17:00:00Z', // Emirates Cup kick-off
          home_team: 'Arsenal', 
          away_team: 'Athletic Club',
          league: 'Emirates Cup',
          value_rating: 8.2,
          implied_probability: 47.6,
          model_probability: 58.4
        },
        {
          id: 'premium-3', 
          bet_type: 'under_2_5_goals',
          recommended_odds: 1.95,
          confidence_score: 78,
          explanation: 'Bournemouth\'s defensive pre-season focus meets Real Sociedad\'s controlled possession style. Both teams prioritize tactical preparation over high-scoring encounters in final friendly preparations.',
          is_premium: true,
          published_at: new Date().toISOString(),
          match_date: '2025-08-09T17:15:00Z', // Vitality Stadium kick-off
          home_team: 'Bournemouth', 
          away_team: 'Real Sociedad',
          league: 'Club Friendly',
          value_rating: 7.8,
          implied_probability: 51.3,
          model_probability: 62.1
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