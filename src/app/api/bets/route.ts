import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET /api/bets - Fetch betting tips
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const premiumOnly = searchParams.get('premium') === 'true';

    // Query real betting tips from database
    let query = `
      SELECT 
        id, bet_type, recommended_odds, confidence_score, explanation,
        is_premium, published_at, match_date, home_team, away_team, league,
        value_rating, implied_probability, model_probability, risk_factors,
        weather_impact, venue_advantage_percentage, market_movement, betting_volume
      FROM betting_tips 
      WHERE published_at IS NOT NULL 
      AND match_date > NOW()
    `;
    
    const queryParams: any[] = [];
    
    if (premiumOnly) {
      query += ` AND is_premium = true`;
    }
    
    query += ` ORDER BY published_at DESC LIMIT $${queryParams.length + 1}`;
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