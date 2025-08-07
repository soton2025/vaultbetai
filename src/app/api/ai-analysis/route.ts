import { NextRequest, NextResponse } from 'next/server';
import { AIDataAnalysisService } from '../../../lib/aiDataAnalysis';
import { OpenAIApiService } from '../../../lib/openaiApi';

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
      case 'comprehensive_analysis':
        if (!data.matchData) {
          return NextResponse.json({
            success: false,
            error: 'Match data is required for comprehensive analysis'
          }, { status: 400 });
        }
        result = await AIDataAnalysisService.generateComprehensiveAnalysis(data.matchData);
        break;

      case 'historical_analysis':
        if (!data.bets || !data.timeframe) {
          return NextResponse.json({
            success: false,
            error: 'Bets data and timeframe are required for historical analysis'
          }, { status: 400 });
        }
        result = await OpenAIApiService.analyzeHistoricalData({
          bets: data.bets,
          timeframe: data.timeframe,
          metrics: data.metrics
        });
        break;

      case 'market_sentiment':
        if (!data.sport || !data.leagues) {
          return NextResponse.json({
            success: false,
            error: 'Sport and leagues are required for market sentiment analysis'
          }, { status: 400 });
        }
        result = await OpenAIApiService.analyzeMarketSentiment({
          sport: data.sport,
          leagues: data.leagues,
          timeframe: data.timeframe || 'current',
          oddsMovements: data.oddsMovements || [],
          publicBettingData: data.publicBettingData
        });
        break;

      case 'advanced_statistics':
        if (!data.teams || !data.matches || !data.analysisType) {
          return NextResponse.json({
            success: false,
            error: 'Teams, matches, and analysis type are required for advanced statistics'
          }, { status: 400 });
        }
        result = await OpenAIApiService.generateAdvancedStatistics({
          teams: data.teams,
          matches: data.matches,
          analysisType: data.analysisType,
          parameters: data.parameters || {}
        });
        break;

      case 'bulk_analysis':
        if (!data.matches || !Array.isArray(data.matches)) {
          return NextResponse.json({
            success: false,
            error: 'Matches array is required for bulk analysis'
          }, { status: 400 });
        }
        result = await AIDataAnalysisService.generateBulkMatchAnalysis(data.matches);
        break;

      case 'betting_trends':
        result = await AIDataAnalysisService.analyzeBettingTrends(data.timeframe || 'last_30_days');
        break;

      case 'test_connection':
        const claudeTest = await OpenAIApiService.testConnection();
        result = {
          success: true,
          connections: {
            openai: claudeTest
          }
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('AI Analysis API Error:', error);
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

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action parameter is required'
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'api_usage_stats':
        const openaiStats = await OpenAIApiService.getApiUsageStats();
        result = {
          success: true,
          stats: {
            openai: openaiStats
          }
        };
        break;

      case 'available_models':
        result = {
          success: true,
          models: {
            openai: OpenAIApiService.MODELS,
            pricing: OpenAIApiService.PRICING
          }
        };
        break;

      case 'health_check':
        const healthCheck = await OpenAIApiService.testConnection();
        result = {
          success: true,
          health: {
            openai: healthCheck,
            timestamp: new Date().toISOString()
          }
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('AI Analysis API GET Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}