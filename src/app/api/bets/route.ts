import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET /api/bets - Fetch betting tips
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const premiumOnly = searchParams.get('premium') === 'true';
    const includeUnpublished = searchParams.get('debug') === 'true';
    
    // Get user data from request headers (set by client)
    const userDataHeader = request.headers.get('X-User-Data');
    let user: any = null;
    
    if (userDataHeader) {
      try {
        user = JSON.parse(decodeURIComponent(userDataHeader));
      } catch (e) {
        console.error('Invalid user data header:', e);
      }
    }

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

    // Try to get real betting tips from database first
    const dbService = new DatabaseService();
    const bets = await dbService.getBettingTips({ 
      limit, 
      includeUnpublished: includeUnpublished,
      premiumOnly: premiumOnly 
    });
    
    // Always return sample data for now to ensure consistent experience
    if (bets.length === 0) {
      const sampleBets = [
        {
          id: 'free-1',
          bet_type: 'over_2_5_goals',
          recommended_odds: 1.85,
          confidence_score: 92,
          explanation: 'Manchester City hosts Chelsea in a crucial Premier League opener. Both teams averaged over 2.8 goals per game in pre-season, with City\'s attacking depth and Chelsea\'s improved forward line creating high-scoring potential.',
          is_premium: false,
          published_at: new Date().toISOString(),
          match_date: '2025-08-18T16:30:00Z', // Premier League opener
          home_team: 'Manchester City',
          away_team: 'Chelsea', 
          league: 'Premier League',
          value_rating: 9.2,
          implied_probability: 54.1,
          model_probability: 71.8
        },
        {
          id: 'premium-1',
          bet_type: 'btts',
          recommended_odds: 1.92,
          confidence_score: 88,
          explanation: 'Arsenal travels to Villa Park for a London-Birmingham derby. Both teams strengthened their attacks this summer, with Villa\'s Watkins and Arsenal\'s new signings creating a high-tempo, goal-heavy encounter expected.',
          is_premium: true,
          published_at: new Date().toISOString(),
          match_date: '2025-08-19T17:30:00Z', // Premier League fixture
          home_team: 'Aston Villa',
          away_team: 'Arsenal',
          league: 'Premier League', 
          value_rating: 8.8,
          implied_probability: 52.1,
          model_probability: 67.4
        },
        {
          id: 'premium-2', 
          bet_type: 'liverpool_win',
          recommended_odds: 1.65,
          confidence_score: 90,
          explanation: 'Liverpool faces newly-promoted Ipswich Town at Anfield. The Reds\' home fortress advantage against Championship promotion winners creates strong value in the season opener with crowd support.',
          is_premium: true,
          published_at: new Date().toISOString(),
          match_date: '2025-08-17T15:00:00Z', // Premier League fixture
          home_team: 'Liverpool', 
          away_team: 'Ipswich Town',
          league: 'Premier League',
          value_rating: 9.0,
          implied_probability: 60.6,
          model_probability: 78.2
        },
        {
          id: 'premium-3', 
          bet_type: 'tottenham_win',
          recommended_odds: 1.78,
          confidence_score: 86,
          explanation: 'Tottenham welcomes Leicester City to North London. Spurs\' attacking trio and home advantage against newly-promoted Leicester creates compelling value in the Premier League opener at the new stadium.',
          is_premium: true,
          published_at: new Date().toISOString(),
          match_date: '2025-08-19T20:00:00Z', // Premier League fixture
          home_team: 'Tottenham', 
          away_team: 'Leicester City',
          league: 'Premier League',
          value_rating: 8.6,
          implied_probability: 56.2,
          model_probability: 72.4
        }
      ];

      // Filter based on user subscription status
      let filteredBets = sampleBets;
      
      // If user doesn't have active subscription, only return non-premium bets
      if (!user?.hasActiveSubscription) {
        filteredBets = sampleBets.filter(bet => !bet.is_premium);
      }
      
      // If premium only is requested and user has subscription
      if (premiumOnly && user?.hasActiveSubscription) {
        filteredBets = sampleBets.filter(bet => bet.is_premium);
      } else if (premiumOnly && !user?.hasActiveSubscription) {
        // If premium requested but user doesn't have subscription, return empty
        filteredBets = [];
      }

      return NextResponse.json({
        success: true,
        data: filteredBets.slice(0, limit),
        count: filteredBets.length,
        total: filteredBets.length,
        message: user?.hasActiveSubscription ? "Sample data - Generate real tips via admin dashboard." : "Free user - Limited access",
        userStatus: user?.hasActiveSubscription ? 'premium' : 'free'
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