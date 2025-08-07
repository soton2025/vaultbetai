import { OpenAIApiService } from './openaiApi';
import { ClaudeApiService } from './claudeApi';
import { DatabaseService } from './database';
import { AnalysisEngine } from './analysisEngine';

// Combined AI Data Analysis Service
export class AIDataAnalysisService {
  
  // Generate comprehensive betting insights combining Claude and OpenAI
  static async generateComprehensiveAnalysis(matchData: any) {
    try {
      console.log(`🔍 Starting comprehensive AI analysis for ${matchData.homeTeam} vs ${matchData.awayTeam}`);

      // 1. Get statistical analysis from existing engine
      const statisticalAnalysis = await AnalysisEngine.analyzeMatch(matchData);

      // 2. Get Claude's betting-focused analysis
      const claudeAnalysis = await ClaudeApiService.generateBettingAnalysis({
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
        league: matchData.league,
        matchDate: matchData.matchDate,
        betType: 'comprehensive',
        teamStats: statisticalAnalysis.analysis.teamStats,
        headToHead: statisticalAnalysis.analysis.headToHead,
        venue: matchData.venue
      });

      // 3. Get OpenAI's data analysis insights
      const historicalData = await this.getHistoricalMatchData(matchData);
      const openaiAnalysis = await OpenAIApiService.analyzeHistoricalData({
        bets: historicalData.similarMatches,
        timeframe: 'last_6_months',
        metrics: {
          teamPerformance: statisticalAnalysis.analysis.teamStats,
          headToHead: statisticalAnalysis.analysis.headToHead,
          venueStats: statisticalAnalysis.analysis.venueAnalysis
        }
      });

      // 4. Generate market sentiment analysis
      const marketSentiment = await OpenAIApiService.analyzeMarketSentiment({
        sport: matchData.sport || 'football',
        leagues: [matchData.league],
        timeframe: 'current',
        oddsMovements: historicalData.oddsMovements || []
      });

      // 5. Combine all analyses into comprehensive insights
      const combinedAnalysis = await this.combineAnalyses({
        statistical: statisticalAnalysis,
        claude: claudeAnalysis,
        openai: openaiAnalysis,
        sentiment: marketSentiment,
        matchData
      });

      // 6. Store analysis results
      await this.storeAnalysisResults(matchData.id, combinedAnalysis);

      return combinedAnalysis;

    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      throw error;
    }
  }

  // Generate personalized user recommendations
  static async generatePersonalizedRecommendations(userId: string, preferences: any) {
    try {
      // Get user's betting history and preferences
      const userHistory = await this.getUserBettingHistory(userId);
      const userMetrics = await this.calculateUserMetrics(userHistory);

      // Generate personalized tips using OpenAI
      const personalizedTips = await OpenAIApiService.generatePersonalizedTips({
        userId,
        preferences,
        bettingHistory: userHistory,
        currentBalance: await this.getCurrentBalance(userId)
      });

      // Get Claude's risk assessment for user
      const riskAssessment = await this.generateUserRiskProfile(userId, userHistory);

      // Combine recommendations
      const recommendations = {
        personalizedTips: personalizedTips.tips,
        riskProfile: riskAssessment,
        bankrollManagement: personalizedTips.bankrollRecommendations,
        priorityBets: personalizedTips.priorityTips,
        performanceInsights: await this.generatePerformanceInsights(userMetrics),
        nextSteps: await this.generateActionableAdvice(userHistory, preferences)
      };

      // Store user recommendations
      await this.storeUserRecommendations(userId, recommendations);

      return recommendations;

    } catch (error) {
      console.error('Personalized recommendations error:', error);
      throw error;
    }
  }

  // Analyze betting patterns and trends
  static async analyzeBettingTrends(timeframe: string = 'last_30_days') {
    try {
      // Get aggregated betting data
      const trendData = await this.getTrendingData(timeframe);

      // Analyze with OpenAI for pattern recognition
      const patternAnalysis = await OpenAIApiService.generateAdvancedStatistics({
        teams: trendData.teams,
        matches: trendData.matches,
        analysisType: 'correlation',
        parameters: {
          timeframe,
          includeOdds: true,
          includeResults: true
        }
      });

      // Get market sentiment from Claude
      const marketInsights = await ClaudeApiService.analyzeMarketOpportunity(
        'market_trends',
        1.0, // placeholder odds
        { homeTeam: 'Market', awayTeam: 'Analysis', league: 'Overall' }
      );

      // Combine trend insights
      const trendAnalysis = {
        patterns: patternAnalysis.correlations,
        predictions: patternAnalysis.predictions,
        marketInsights: marketInsights.marketAnalysis,
        recommendations: await this.generateTrendBasedRecommendations(trendData),
        confidence: patternAnalysis.confidence,
        timeframe
      };

      return trendAnalysis;

    } catch (error) {
      console.error('Trend analysis error:', error);
      throw error;
    }
  }

  // Generate AI-powered tips for multiple matches
  static async generateBulkMatchAnalysis(matches: any[]) {
    try {
      const analyses = [];

      // Process matches in batches to avoid rate limits
      const batchSize = 3;
      for (let i = 0; i < matches.length; i += batchSize) {
        const batch = matches.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (match) => {
          try {
            return await this.generateComprehensiveAnalysis(match);
          } catch (error) {
            console.error(`Analysis failed for match ${match.id}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        analyses.push(...batchResults.filter(result => result !== null));

        // Small delay between batches
        if (i + batchSize < matches.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Rank analyses by confidence and potential value
      const rankedAnalyses = this.rankAnalysesByValue(analyses);

      return {
        totalMatches: matches.length,
        successfulAnalyses: analyses.length,
        topRecommendations: rankedAnalyses.slice(0, 5),
        allAnalyses: rankedAnalyses
      };

    } catch (error) {
      console.error('Bulk analysis error:', error);
      throw error;
    }
  }

  // Private helper methods

  private static async getHistoricalMatchData(matchData: any) {
    const query = `
      SELECT 
        m.*,
        b.result,
        b.odds,
        b.stake
      FROM matches m
      LEFT JOIN bets b ON m.id = b.match_id
      WHERE (m.home_team = $1 OR m.away_team = $1 OR m.home_team = $2 OR m.away_team = $2)
        AND m.match_date >= CURRENT_DATE - INTERVAL '6 months'
        AND m.match_date < $3
      ORDER BY m.match_date DESC
      LIMIT 50
    `;

    try {
      const result = await DatabaseService.query(query, [
        matchData.homeTeam,
        matchData.awayTeam,
        matchData.matchDate
      ]);

      return {
        similarMatches: result.rows,
        oddsMovements: [] // TODO: Implement odds tracking
      };
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return { similarMatches: [], oddsMovements: [] };
    }
  }

  private static async combineAnalyses(analyses: {
    statistical: any;
    claude: any;
    openai: any;
    sentiment: any;
    matchData: any;
  }) {
    const { statistical, claude, openai, sentiment, matchData } = analyses;

    // Create comprehensive analysis combining all AI insights
    const combinedInsights = {
      match: {
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
        league: matchData.league,
        date: matchData.matchDate
      },
      predictions: {
        statistical: statistical.predictions[0] || null,
        claude: {
          confidence: claude.confidence,
          analysis: claude.analysis,
          riskFactors: claude.riskFactors,
          valueRating: claude.valueRating
        },
        consensus: await this.generateConsensusRecommendation(statistical, claude)
      },
      insights: {
        dataPatterns: openai.insights,
        marketSentiment: sentiment.sentiment,
        historicalTrends: openai.patterns,
        riskAssessment: claude.riskFactors
      },
      recommendations: {
        primary: await this.selectPrimaryRecommendation(statistical, claude),
        alternative: await this.generateAlternativeOptions(statistical, claude),
        stakeSuggestion: await this.calculateOptimalStake(statistical, claude, openai),
        confidence: await this.calculateOverallConfidence(statistical, claude, openai)
      },
      metadata: {
        analysisDate: new Date().toISOString(),
        dataQuality: this.assessDataQuality(statistical, claude, openai),
        aiSources: ['statistical_engine', 'claude_analysis', 'openai_insights', 'market_sentiment']
      }
    };

    return combinedInsights;
  }

  private static async getUserBettingHistory(userId: string) {
    const query = `
      SELECT * FROM user_bets 
      WHERE user_id = $1 
      ORDER BY bet_date DESC 
      LIMIT 100
    `;

    try {
      const result = await DatabaseService.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching user history:', error);
      return [];
    }
  }

  private static async calculateUserMetrics(userHistory: any[]) {
    return {
      totalBets: userHistory.length,
      winRate: this.calculateWinRate(userHistory),
      avgStake: this.calculateAverageStake(userHistory),
      totalProfit: this.calculateTotalProfit(userHistory),
      bestBetType: this.findBestBetType(userHistory),
      riskLevel: this.assessUserRiskLevel(userHistory)
    };
  }

  private static calculateWinRate(bets: any[]): number {
    if (bets.length === 0) return 0;
    const wins = bets.filter(bet => bet.result === 'win').length;
    return (wins / bets.length) * 100;
  }

  private static calculateAverageStake(bets: any[]): number {
    if (bets.length === 0) return 0;
    const totalStake = bets.reduce((sum, bet) => sum + (bet.stake || 0), 0);
    return totalStake / bets.length;
  }

  private static calculateTotalProfit(bets: any[]): number {
    return bets.reduce((profit, bet) => {
      const stake = bet.stake || 0;
      const payout = bet.payout || 0;
      return profit + (payout - stake);
    }, 0);
  }

  private static findBestBetType(bets: any[]): string {
    const typeStats = bets.reduce((stats, bet) => {
      const type = bet.bet_type || 'unknown';
      if (!stats[type]) stats[type] = { wins: 0, total: 0 };
      stats[type].total++;
      if (bet.result === 'win') stats[type].wins++;
      return stats;
    }, {} as Record<string, { wins: number; total: number }>);

    let bestType = 'match_result';
    let bestRate = 0;

    Object.entries(typeStats).forEach(([type, stats]) => {
      const typedStats = stats as { wins: number; total: number };
      const rate = typedStats.wins / typedStats.total;
      if (rate > bestRate && typedStats.total >= 5) {
        bestRate = rate;
        bestType = type;
      }
    });

    return bestType;
  }

  private static assessUserRiskLevel(bets: any[]): 'low' | 'medium' | 'high' {
    if (bets.length === 0) return 'medium';
    
    const avgOdds = bets.reduce((sum, bet) => sum + (bet.odds || 2.0), 0) / bets.length;
    const stakeVariance = this.calculateStakeVariance(bets);

    if (avgOdds < 2.0 && stakeVariance < 50) return 'low';
    if (avgOdds > 5.0 || stakeVariance > 200) return 'high';
    return 'medium';
  }

  private static calculateStakeVariance(bets: any[]): number {
    const avgStake = this.calculateAverageStake(bets);
    const variance = bets.reduce((sum, bet) => {
      const diff = (bet.stake || 0) - avgStake;
      return sum + (diff * diff);
    }, 0) / bets.length;
    return Math.sqrt(variance);
  }

  private static async getCurrentBalance(userId: string): Promise<number> {
    const query = `
      SELECT balance FROM user_accounts 
      WHERE user_id = $1
    `;

    try {
      const result = await DatabaseService.query(query, [userId]);
      return result.rows[0]?.balance || 0;
    } catch (error) {
      console.error('Error fetching user balance:', error);
      return 0;
    }
  }

  private static async generateUserRiskProfile(userId: string, history: any[]) {
    // Use Claude to assess user risk profile
    return ClaudeApiService.generateTeamComparison(
      `User ${userId} Risk Profile`,
      'Conservative Bettor',
      'Risk Analysis'
    );
  }

  private static async generatePerformanceInsights(metrics: any) {
    return {
      strengths: this.identifyStrengths(metrics),
      improvements: this.identifyImprovements(metrics),
      trends: this.identifyTrends(metrics)
    };
  }

  private static identifyStrengths(metrics: any): string[] {
    const strengths = [];
    if (metrics.winRate > 55) strengths.push('Above-average win rate');
    if (metrics.totalProfit > 0) strengths.push('Profitable betting record');
    if (metrics.riskLevel === 'low') strengths.push('Conservative risk management');
    return strengths;
  }

  private static identifyImprovements(metrics: any): string[] {
    const improvements = [];
    if (metrics.winRate < 50) improvements.push('Focus on higher probability bets');
    if (metrics.totalProfit < 0) improvements.push('Review stake sizing strategy');
    if (metrics.riskLevel === 'high') improvements.push('Consider reducing bet variance');
    return improvements;
  }

  private static identifyTrends(metrics: any): string[] {
    return [
      `Best performance in ${metrics.bestBetType} bets`,
      `Average stake of $${metrics.avgStake.toFixed(2)}`,
      `Overall ${metrics.riskLevel} risk approach`
    ];
  }

  private static async generateActionableAdvice(history: any[], preferences: any) {
    return [
      'Focus on your most successful bet types',
      'Maintain consistent stake sizing',
      'Track performance metrics regularly',
      'Consider diversifying across different markets'
    ];
  }

  private static async getTrendingData(timeframe: string) {
    const query = `
      SELECT 
        m.*,
        t1.name as home_team_name,
        t2.name as away_team_name
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      WHERE m.match_date >= CURRENT_DATE - INTERVAL '${timeframe.replace('last_', '').replace('_', ' ')}'
      ORDER BY m.match_date DESC
      LIMIT 200
    `;

    try {
      const result = await DatabaseService.query(query);
      return {
        matches: result.rows,
        teams: await this.getUniqueTeams(result.rows)
      };
    } catch (error) {
      console.error('Error fetching trending data:', error);
      return { matches: [], teams: [] };
    }
  }

  private static async getUniqueTeams(matches: any[]) {
    const teamIds = new Set();
    matches.forEach(match => {
      teamIds.add(match.home_team_id);
      teamIds.add(match.away_team_id);
    });

    const query = `
      SELECT * FROM teams 
      WHERE id = ANY($1)
    `;

    try {
      const result = await DatabaseService.query(query, [Array.from(teamIds)]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching team data:', error);
      return [];
    }
  }

  private static async generateTrendBasedRecommendations(trendData: any) {
    return [
      'Consider seasonal performance patterns',
      'Monitor team form across different competitions',
      'Track home/away performance differentials',
      'Identify value opportunities in lesser-known markets'
    ];
  }

  private static rankAnalysesByValue(analyses: any[]) {
    return analyses.sort((a, b) => {
      const scoreA = (a.recommendations?.confidence || 0) + (a.predictions?.claude?.valueRating || 0);
      const scoreB = (b.recommendations?.confidence || 0) + (b.predictions?.claude?.valueRating || 0);
      return scoreB - scoreA;
    });
  }

  private static async generateConsensusRecommendation(statistical: any, claude: any) {
    const statPred = statistical.predictions[0];
    const claudeConf = claude.confidence || 0;
    
    if (!statPred) {
      return {
        betType: 'no_consensus',
        confidence: claudeConf,
        reasoning: 'Insufficient statistical data for consensus'
      };
    }

    // Simple consensus logic - can be enhanced
    if (statPred.confidence > 70 && claudeConf > 70) {
      return {
        betType: statPred.betType,
        confidence: Math.round((statPred.confidence + claudeConf) / 2),
        reasoning: 'Strong consensus between statistical and AI analysis'
      };
    }

    return {
      betType: statPred.confidence > claudeConf ? statPred.betType : 'follow_claude',
      confidence: Math.max(statPred.confidence, claudeConf),
      reasoning: 'Moderate consensus with preference for higher confidence source'
    };
  }

  private static async selectPrimaryRecommendation(statistical: any, claude: any) {
    const consensus = await this.generateConsensusRecommendation(statistical, claude);
    return {
      betType: consensus.betType,
      confidence: consensus.confidence,
      reasoning: consensus.reasoning,
      expectedOdds: statistical.predictions[0]?.recommendedOdds || 2.0
    };
  }

  private static async generateAlternativeOptions(statistical: any, claude: any) {
    return [
      {
        betType: 'over_2_5_goals',
        confidence: 65,
        reasoning: 'Alternative option based on goal statistics'
      },
      {
        betType: 'btts',
        confidence: 60,
        reasoning: 'Both teams show scoring consistency'
      }
    ];
  }

  private static async calculateOptimalStake(statistical: any, claude: any, openai: any) {
    const confidence = await this.calculateOverallConfidence(statistical, claude, openai);
    const baseStake = 10; // Base stake in currency units
    
    // Kelly criterion approximation
    const kellyMultiplier = Math.min(2.0, confidence / 100);
    return Math.round(baseStake * kellyMultiplier);
  }

  private static async calculateOverallConfidence(statistical: any, claude: any, openai: any) {
    const statConf = statistical.predictions[0]?.confidence || 50;
    const claudeConf = claude.confidence || 50;
    const openaiQuality = openai.success ? 85 : 60;
    
    // Weighted average
    return Math.round((statConf * 0.4 + claudeConf * 0.4 + openaiQuality * 0.2));
  }

  private static assessDataQuality(statistical: any, claude: any, openai: any) {
    let quality = 0;
    if (statistical.predictions.length > 0) quality += 0.4;
    if (claude.success) quality += 0.4;
    if (openai.success) quality += 0.2;
    
    if (quality >= 0.8) return 'high';
    if (quality >= 0.6) return 'medium';
    return 'low';
  }

  private static async storeAnalysisResults(matchId: string, analysis: any) {
    const query = `
      INSERT INTO ai_analyses (match_id, analysis_data, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (match_id) DO UPDATE SET
        analysis_data = $2,
        updated_at = CURRENT_TIMESTAMP
    `;

    try {
      await DatabaseService.query(query, [matchId, JSON.stringify(analysis)]);
    } catch (error) {
      console.error('Error storing analysis results:', error);
    }
  }

  private static async storeUserRecommendations(userId: string, recommendations: any) {
    const query = `
      INSERT INTO user_recommendations (user_id, recommendations, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
    `;

    try {
      await DatabaseService.query(query, [userId, JSON.stringify(recommendations)]);
    } catch (error) {
      console.error('Error storing user recommendations:', error);
    }
  }
}