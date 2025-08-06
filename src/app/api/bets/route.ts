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

    // If no real tips exist, return empty array instead of mock data
    if (bets.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        total: 0,
        message: "No betting tips available. Generate tips via admin dashboard."
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