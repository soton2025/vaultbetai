import { NextRequest, NextResponse } from 'next/server';
import { OpenAIApiService } from '../../../lib/openaiApi';

export async function GET(request: NextRequest) {
  try {
    // Test OpenAI API connection
    const connectionTest = await OpenAIApiService.testConnection();
    
    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API connection failed',
        details: 'Check if OPENAI_API_KEY is properly configured'
      }, { status: 500 });
    }

    // Get API usage stats
    const usageStats = await OpenAIApiService.getApiUsageStats();

    // Test data analysis functionality
    const testAnalysis = await OpenAIApiService.analyzeHistoricalData({
      bets: [
        { betType: 'over_2_5_goals', result: 'win', stake: 10, odds: 2.1, payout: 21 },
        { betType: 'match_result', result: 'loss', stake: 15, odds: 1.8, payout: 0 },
        { betType: 'btts', result: 'win', stake: 12, odds: 1.9, payout: 22.8 }
      ],
      timeframe: 'test_week',
      metrics: {
        totalBets: 3,
        winRate: 66.7,
        totalProfit: 18.8
      }
    });

    return NextResponse.json({
      success: true,
      message: 'OpenAI integration working correctly',
      tests: {
        connection: connectionTest,
        dataAnalysis: testAnalysis.success,
        usageTracking: usageStats.length > 0
      },
      usageStats,
      sampleAnalysis: testAnalysis.success ? {
        insights: testAnalysis.insights?.slice(0, 2),
        recommendations: testAnalysis.recommendations?.slice(0, 2)
      } : null,
      availableModels: OpenAIApiService.MODELS,
      pricing: OpenAIApiService.PRICING
    });

  } catch (error) {
    console.error('OpenAI Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'OpenAI integration test failed'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType, testData } = body;

    if (!testType) {
      return NextResponse.json({
        success: false,
        error: 'Test type is required'
      }, { status: 400 });
    }

    let result;

    switch (testType) {
      case 'historical_analysis':
        result = await OpenAIApiService.analyzeHistoricalData({
          bets: testData?.bets || [],
          timeframe: testData?.timeframe || 'test',
          metrics: testData?.metrics
        });
        break;

      case 'personalized_tips':
        result = await OpenAIApiService.generatePersonalizedTips({
          userId: 'test_user',
          preferences: {
            sportTypes: ['football'],
            riskLevel: 'medium',
            budgetRange: '10-50',
            favoriteLeagues: ['Premier League']
          },
          bettingHistory: testData?.bettingHistory || []
        });
        break;

      case 'market_sentiment':
        result = await OpenAIApiService.analyzeMarketSentiment({
          sport: 'football',
          leagues: ['Premier League'],
          timeframe: 'current',
          oddsMovements: testData?.oddsMovements || []
        });
        break;

      case 'advanced_stats':
        result = await OpenAIApiService.generateAdvancedStatistics({
          teams: testData?.teams || [{ name: 'Test Team A' }, { name: 'Test Team B' }],
          matches: testData?.matches || [{ homeTeam: 'Test Team A', awayTeam: 'Test Team B' }],
          analysisType: 'correlation',
          parameters: testData?.parameters || {}
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown test type: ${testType}`
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      testType,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OpenAI Test POST Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      testType: 'unknown'
    }, { status: 500 });
  }
}