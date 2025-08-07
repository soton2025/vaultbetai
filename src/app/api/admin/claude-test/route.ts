import { NextRequest, NextResponse } from 'next/server';
import { ClaudeApiService } from '@/lib/claudeApi';

// GET /api/admin/claude-test - Test Claude API connection
export async function GET(request: NextRequest) {
  try {
    console.log('Testing Claude API connection...');
    
    const isConnected = await ClaudeApiService.testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Claude API is connected and working correctly',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Claude API connection test failed',
        message: 'Check API key configuration in environment variables'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Claude API test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test Claude API',
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'Ensure CLAUDE_API_KEY is set in environment variables'
    }, { status: 500 });
  }
}

// POST /api/admin/claude-test - Generate sample analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Default test match if none provided
    const matchData = {
      homeTeam: body.homeTeam || 'Arsenal',
      awayTeam: body.awayTeam || 'Chelsea', 
      league: body.league || 'Premier League',
      matchDate: body.matchDate || '2025-08-15T15:00:00Z',
      betType: body.betType || 'btts',
      venue: body.venue || 'Emirates Stadium'
    };

    console.log('Generating Claude analysis for test match:', matchData);
    
    const result = await ClaudeApiService.generateBettingAnalysis(matchData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Claude analysis generated successfully',
        data: {
          analysis: result.analysis,
          confidence: result.confidence,
          riskFactors: result.riskFactors,
          valueRating: result.valueRating,
          matchData
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate analysis',
        details: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Claude analysis generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate Claude analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}