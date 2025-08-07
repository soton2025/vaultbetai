import { NextRequest, NextResponse } from 'next/server';
import { AITipsGenerator } from '../../../lib/aiTipsGenerator';
import { AIDataAnalysisService } from '../../../lib/aiDataAnalysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action parameter is required'
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'generate_daily_tips':
        result = await AITipsGenerator.generateDailyTips(data?.date);
        break;

      case 'generate_personalized_tips':
        if (!data?.userId) {
          return NextResponse.json({
            success: false,
            error: 'User ID is required for personalized tips'
          }, { status: 400 });
        }
        result = await AITipsGenerator.generatePersonalizedTips(data.userId, data.preferences);
        break;

      case 'generate_league_tips':
        if (!data?.league) {
          return NextResponse.json({
            success: false,
            error: 'League is required for league-specific tips'
          }, { status: 400 });
        }
        result = await AITipsGenerator.generateLeagueTips(data.league, data.timeframe);
        break;

      case 'generate_bet_type_tips':
        if (!data?.betType) {
          return NextResponse.json({
            success: false,
            error: 'Bet type is required for bet-type-specific tips'
          }, { status: 400 });
        }
        result = await AITipsGenerator.generateBetTypeTips(data.betType, data.filters);
        break;

      case 'personalized_recommendations':
        if (!data?.userId) {
          return NextResponse.json({
            success: false,
            error: 'User ID is required for personalized recommendations'
          }, { status: 400 });
        }
        result = await AIDataAnalysisService.generatePersonalizedRecommendations(
          data.userId, 
          data.preferences
        );
        break;

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('AI Tips API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');
    const league = searchParams.get('league');
    const betType = searchParams.get('betType');

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action parameter is required'
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'daily_tips':
        result = await AITipsGenerator.generateDailyTips(date || undefined);
        break;

      case 'personalized_tips':
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'User ID is required for personalized tips'
          }, { status: 400 });
        }
        result = await AITipsGenerator.generatePersonalizedTips(userId);
        break;

      case 'league_tips':
        if (!league) {
          return NextResponse.json({
            success: false,
            error: 'League parameter is required for league tips'
          }, { status: 400 });
        }
        result = await AITipsGenerator.generateLeagueTips(league);
        break;

      case 'bet_type_tips':
        if (!betType) {
          return NextResponse.json({
            success: false,
            error: 'Bet type parameter is required for bet type tips'
          }, { status: 400 });
        }
        result = await AITipsGenerator.generateBetTypeTips(betType);
        break;

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('AI Tips API GET Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}