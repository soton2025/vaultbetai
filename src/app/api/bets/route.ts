import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET /api/bets - Fetch betting tips
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const premiumOnly = searchParams.get('premium') === 'true';

    // For now, we'll return mock data but structure it to match database format
    // This allows frontend to work while we build the full automation system
    const mockBets = [
      {
        id: '1',
        bet_type: 'over_2_5_goals',
        recommended_odds: 2.15,
        confidence_score: 87,
        explanation: 'Both teams have strong attacking records with Manchester City averaging 2.8 goals per game at home and Arsenal scoring in 9 of their last 10 away matches. The weather conditions are perfect and both teams are in excellent form.',
        is_premium: false,
        published_at: new Date().toISOString(),
        match_date: '2024-12-20T15:30:00Z',
        home_team: 'Manchester City',
        away_team: 'Arsenal',
        league: 'Premier League',
        value_rating: null,
        implied_probability: null,
        model_probability: null,
        risk_factors: null,
        weather_impact: null,
        venue_advantage_percentage: null,
        market_movement: null,
        betting_volume: null
      },
      {
        id: '2',
        bet_type: 'btts',
        recommended_odds: 1.85,
        confidence_score: 92,
        explanation: 'Liverpool and Chelsea both have leaky defenses but potent attacks. Liverpool has conceded in 7 of their last 8 home games, while Chelsea has scored in every away match this season.',
        is_premium: true,
        published_at: new Date().toISOString(),
        match_date: '2024-12-20T17:45:00Z',
        home_team: 'Liverpool',
        away_team: 'Chelsea',
        league: 'Premier League',
        value_rating: 8,
        implied_probability: 54.1,
        model_probability: 61.3,
        risk_factors: [
          'Liverpool\'s defensive frailties at set pieces',
          'Chelsea\'s inconsistent away form against top 6',
          'Potential rotation due to fixture congestion',
          'Weather conditions may favor defensive play'
        ],
        weather_impact: 'neutral',
        venue_advantage_percentage: 78,
        market_movement: 'backing',
        betting_volume: 'high'
      },
      {
        id: '3',
        bet_type: 'home_win',
        recommended_odds: 1.95,
        confidence_score: 78,
        explanation: 'Barcelona has been dominant at Camp Nou with 8 wins in their last 10 home matches. Real Madrid is missing 3 key players due to injury and has struggled in recent away fixtures.',
        is_premium: true,
        published_at: new Date().toISOString(),
        match_date: '2024-12-21T20:00:00Z',
        home_team: 'Barcelona',
        away_team: 'Real Madrid',
        league: 'La Liga',
        value_rating: 7,
        implied_probability: 51.3,
        model_probability: 58.7,
        risk_factors: [
          'El Clasico unpredictability factor',
          'Real Madrid\'s big game experience',
          'Potential referee pressure in high-profile match',
          'Barcelona\'s European fixture fatigue'
        ],
        weather_impact: 'positive',
        venue_advantage_percentage: 82,
        market_movement: 'backing',
        betting_volume: 'high'
      }
    ];

    // Filter based on premium requirement
    const filteredBets = premiumOnly 
      ? mockBets.filter(bet => bet.is_premium) 
      : mockBets;

    // Limit results
    const limitedBets = filteredBets.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limitedBets,
      count: limitedBets.length,
      total: filteredBets.length
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