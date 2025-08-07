import { AIDataAnalysisService } from './aiDataAnalysis';
import { OpenAIApiService } from './openaiApi';
import { ClaudeApiService } from './claudeApi';
import { DatabaseService } from './database';

// AI-Powered Tips Generation Service
export class AITipsGenerator {
  
  // Generate daily betting tips using combined AI analysis
  static async generateDailyTips(date?: string) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      console.log(`🎯 Generating daily tips for ${targetDate}`);

      // 1. Get matches for the specified date
      const matches = await this.getMatchesForDate(targetDate);
      if (matches.length === 0) {
        return {
          success: true,
          tips: [],
          message: 'No matches found for specified date'
        };
      }

      // 2. Generate comprehensive analysis for each match
      const analyses = await AIDataAnalysisService.generateBulkMatchAnalysis(matches);

      // 3. Filter and rank tips based on quality criteria
      const qualityTips = this.filterHighQualityTips(analyses.allAnalyses);

      // 4. Generate summary insights
      const dailySummary = await this.generateDailySummary(qualityTips, targetDate);

      // 5. Create final tip packages
      const formattedTips = qualityTips.map(analysis => this.formatTipForPresentation(analysis));

      // 6. Store daily tips
      await this.storeDailyTips(targetDate, formattedTips, dailySummary);

      return {
        success: true,
        date: targetDate,
        totalMatches: matches.length,
        qualityTips: formattedTips,
        summary: dailySummary,
        metadata: {
          generatedAt: new Date().toISOString(),
          aiSources: ['claude', 'openai', 'statistical_engine'],
          qualityScore: this.calculateOverallQualityScore(formattedTips)
        }
      };

    } catch (error) {
      console.error('Daily tips generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generate tips for a specific user based on their preferences
  static async generatePersonalizedTips(userId: string, preferences?: any) {
    try {
      console.log(`👤 Generating personalized tips for user ${userId}`);

      // 1. Get user preferences and history
      const userProfile = await this.getUserProfile(userId);
      const userPreferences = preferences || userProfile.preferences;

      // 2. Get recommended matches based on user preferences
      const recommendedMatches = await this.getRecommendedMatches(userPreferences);

      // 3. Generate personalized recommendations
      const personalizedRecs = await AIDataAnalysisService.generatePersonalizedRecommendations(
        userId, 
        userPreferences
      );

      // 4. Analyze specific matches for this user
      const matchAnalyses = [];
      for (const match of recommendedMatches.slice(0, 5)) {
        const analysis = await AIDataAnalysisService.generateComprehensiveAnalysis(match);
        if (analysis) {
          // Personalize the analysis based on user profile
          analysis.personalizedInsights = await this.personalizeAnalysis(analysis, userProfile);
          matchAnalyses.push(analysis);
        }
      }

      // 5. Create personalized tip recommendations
      const personalizedTips = {
        userId,
        recommendations: personalizedRecs,
        matchTips: matchAnalyses.map(analysis => this.formatPersonalizedTip(analysis, userProfile)),
        riskProfile: userProfile.riskLevel,
        suggestedBankroll: this.calculateRecommendedBankroll(userProfile),
        nextActions: this.generateNextActions(userProfile, matchAnalyses)
      };

      // 6. Store personalized tips
      await this.storePersonalizedTips(userId, personalizedTips);

      return {
        success: true,
        personalizedTips,
        metadata: {
          generatedAt: new Date().toISOString(),
          userRiskLevel: userProfile.riskLevel,
          recommendationCount: personalizedTips.matchTips.length
        }
      };

    } catch (error) {
      console.error('Personalized tips generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generate league-specific tips and insights
  static async generateLeagueTips(league: string, timeframe: string = 'upcoming') {
    try {
      console.log(`🏆 Generating tips for ${league} - ${timeframe}`);

      // 1. Get league matches and data
      const leagueData = await this.getLeagueData(league, timeframe);

      // 2. Analyze league trends and patterns
      const trendAnalysis = await AIDataAnalysisService.analyzeBettingTrends(`league_${timeframe}`);

      // 3. Generate league-specific insights using OpenAI
      const leagueInsights = await OpenAIApiService.analyzeMarketSentiment({
        sport: 'football',
        leagues: [league],
        timeframe,
        oddsMovements: leagueData.oddsHistory || []
      });

      // 4. Get Claude's tactical analysis for the league
      const tacticalAnalysis = await this.generateLeagueTacticalAnalysis(league, leagueData);

      // 5. Identify top opportunities in the league
      const topOpportunities = await this.identifyLeagueOpportunities(leagueData, trendAnalysis);

      // 6. Create comprehensive league tips package
      const leagueTips = {
        league,
        timeframe,
        insights: leagueInsights,
        trends: trendAnalysis,
        tactical: tacticalAnalysis,
        topOpportunities,
        riskFactors: this.identifyLeagueRisks(leagueData),
        recommendations: this.generateLeagueRecommendations(leagueData, trendAnalysis)
      };

      return {
        success: true,
        leagueTips,
        metadata: {
          matchesAnalyzed: leagueData.matches.length,
          teamsIncluded: leagueData.teams.length,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('League tips generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generate tips for specific bet types (e.g., Over/Under, BTTS, etc.)
  static async generateBetTypeTips(betType: string, filters?: any) {
    try {
      console.log(`📊 Generating tips for bet type: ${betType}`);

      // 1. Get matches suitable for this bet type
      const suitableMatches = await this.getMatchesForBetType(betType, filters);

      // 2. Analyze historical performance for this bet type
      const historicalData = await this.getBetTypeHistoricalData(betType);

      // 3. Use OpenAI to analyze patterns for this specific bet type
      const patternAnalysis = await OpenAIApiService.generateAdvancedStatistics({
        teams: suitableMatches.map(m => ({ name: m.homeTeam })),
        matches: suitableMatches,
        analysisType: 'prediction',
        parameters: {
          betType,
          includeHistorical: true,
          focusOnPatterns: true
        }
      });

      // 4. Generate specific recommendations for each match
      const betTypeRecommendations = [];
      for (const match of suitableMatches.slice(0, 10)) {
        const analysis = await this.generateBetTypeSpecificAnalysis(match, betType);
        if (analysis && analysis.confidence > 65) {
          betTypeRecommendations.push(analysis);
        }
      }

      // 5. Create bet type insights
      const betTypeTips = {
        betType,
        historicalPerformance: this.calculateBetTypePerformance(historicalData),
        patterns: patternAnalysis,
        recommendations: betTypeRecommendations.sort((a, b) => b.confidence - a.confidence),
        bestOpportunities: this.identifyBestBetTypeOpportunities(betTypeRecommendations),
        riskConsiderations: this.getBetTypeRisks(betType, historicalData)
      };

      return {
        success: true,
        betTypeTips,
        metadata: {
          betType,
          matchesAnalyzed: suitableMatches.length,
          recommendationsGenerated: betTypeRecommendations.length,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Bet type tips generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Private helper methods

  private static async getMatchesForDate(date: string) {
    const query = `
      SELECT 
        m.*,
        t1.name as home_team_name,
        t2.name as away_team_name,
        l.name as league_name
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      JOIN leagues l ON m.league_id = l.id
      WHERE DATE(m.match_date) = $1
        AND m.status = 'scheduled'
      ORDER BY m.match_date ASC
    `;

    try {
      const result = await DatabaseService.query(query, [date]);
      return result.rows.map(row => ({
        id: row.id,
        homeTeam: row.home_team_name,
        awayTeam: row.away_team_name,
        league: row.league_name,
        matchDate: row.match_date,
        homeTeamId: row.home_team_id,
        awayTeamId: row.away_team_id,
        venue: row.venue
      }));
    } catch (error) {
      console.error('Error fetching matches for date:', error);
      return [];
    }
  }

  private static filterHighQualityTips(analyses: any[]) {
    return analyses.filter(analysis => {
      // Filter criteria for high-quality tips
      const hasHighConfidence = analysis.recommendations?.confidence >= 70;
      const hasGoodDataQuality = analysis.metadata?.dataQuality !== 'low';
      const hasConsensus = analysis.predictions?.consensus?.confidence >= 65;
      
      return hasHighConfidence && hasGoodDataQuality && hasConsensus;
    });
  }

  private static async generateDailySummary(tips: any[], date: string) {
    const summary = {
      date,
      totalTips: tips.length,
      averageConfidence: this.calculateAverageConfidence(tips),
      betTypeDistribution: this.analyzeBetTypeDistribution(tips),
      leagueDistribution: this.analyzeLeagueDistribution(tips),
      riskAssessment: this.assessOverallRisk(tips),
      keyInsights: await this.generateKeyInsights(tips),
      recommendation: this.generateOverallRecommendation(tips)
    };

    return summary;
  }

  private static formatTipForPresentation(analysis: any) {
    return {
      matchId: analysis.match.homeTeam + '_vs_' + analysis.match.awayTeam,
      match: `${analysis.match.homeTeam} vs ${analysis.match.awayTeam}`,
      league: analysis.match.league,
      date: analysis.match.date,
      recommendation: {
        betType: analysis.recommendations.primary.betType,
        confidence: analysis.recommendations.primary.confidence,
        suggestedStake: analysis.recommendations.stakeSuggestion,
        expectedOdds: analysis.recommendations.primary.expectedOdds,
        reasoning: analysis.recommendations.primary.reasoning
      },
      insights: {
        keyPoints: this.extractKeyPoints(analysis),
        riskFactors: analysis.insights.riskAssessment,
        dataQuality: analysis.metadata.dataQuality
      },
      alternatives: analysis.recommendations.alternative || []
    };
  }

  private static async getUserProfile(userId: string) {
    const query = `
      SELECT 
        u.*,
        up.preferences,
        ub.win_rate,
        ub.total_bets,
        ub.avg_stake,
        ub.risk_level
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      LEFT JOIN user_betting_stats ub ON u.id = ub.user_id
      WHERE u.id = $1
    `;

    try {
      const result = await DatabaseService.query(query, [userId]);
      const user = result.rows[0];
      
      return {
        id: userId,
        preferences: user?.preferences || this.getDefaultPreferences(),
        stats: {
          winRate: user?.win_rate || 0,
          totalBets: user?.total_bets || 0,
          avgStake: user?.avg_stake || 10,
          riskLevel: user?.risk_level || 'medium'
        },
        riskLevel: user?.risk_level || 'medium'
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        id: userId,
        preferences: this.getDefaultPreferences(),
        stats: { winRate: 0, totalBets: 0, avgStake: 10, riskLevel: 'medium' },
        riskLevel: 'medium'
      };
    }
  }

  private static getDefaultPreferences() {
    return {
      sportTypes: ['football'],
      riskLevel: 'medium',
      budgetRange: '10-50',
      favoriteLeagues: ['Premier League', 'Champions League'],
      preferredBetTypes: ['match_result', 'over_under', 'btts']
    };
  }

  private static async getRecommendedMatches(preferences: any) {
    const leagues = preferences.favoriteLeagues || ['Premier League'];
    const query = `
      SELECT 
        m.*,
        t1.name as home_team_name,
        t2.name as away_team_name,
        l.name as league_name
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      JOIN leagues l ON m.league_id = l.id
      WHERE l.name = ANY($1)
        AND m.match_date >= CURRENT_TIMESTAMP
        AND m.match_date <= CURRENT_TIMESTAMP + INTERVAL '7 days'
        AND m.status = 'scheduled'
      ORDER BY m.match_date ASC
      LIMIT 20
    `;

    try {
      const result = await DatabaseService.query(query, [leagues]);
      return result.rows.map(row => ({
        id: row.id,
        homeTeam: row.home_team_name,
        awayTeam: row.away_team_name,
        league: row.league_name,
        matchDate: row.match_date,
        homeTeamId: row.home_team_id,
        awayTeamId: row.away_team_id
      }));
    } catch (error) {
      console.error('Error fetching recommended matches:', error);
      return [];
    }
  }

  private static async personalizeAnalysis(analysis: any, userProfile: any) {
    // Customize analysis based on user's risk level and preferences
    const personalizedInsights = {
      riskAdjustment: this.adjustForUserRisk(analysis, userProfile.riskLevel),
      stakeRecommendation: this.personalizeStakeSize(analysis, userProfile),
      alternativeOptions: this.getAlternativesForUser(analysis, userProfile),
      warningFlags: this.generateUserSpecificWarnings(analysis, userProfile)
    };

    return personalizedInsights;
  }

  private static formatPersonalizedTip(analysis: any, userProfile: any) {
    const baseTip = this.formatTipForPresentation(analysis);
    
    return {
      ...baseTip,
      personalized: {
        adjustedConfidence: this.adjustConfidenceForUser(baseTip.recommendation.confidence, userProfile),
        customStakeSize: this.calculatePersonalizedStake(baseTip.recommendation.suggestedStake, userProfile),
        userSpecificRisks: analysis.personalizedInsights?.warningFlags || [],
        alternativeForUser: analysis.personalizedInsights?.alternativeOptions || []
      }
    };
  }

  private static calculateRecommendedBankroll(userProfile: any) {
    const baseAmount = 100; // Base recommendation
    const riskMultiplier = userProfile.riskLevel === 'low' ? 0.5 : 
                          userProfile.riskLevel === 'high' ? 2.0 : 1.0;
    
    return Math.round(baseAmount * riskMultiplier);
  }

  private static generateNextActions(userProfile: any, analyses: any[]) {
    const actions = [];
    
    if (analyses.length === 0) {
      actions.push('Wait for higher quality betting opportunities');
    } else {
      actions.push(`Consider ${analyses[0].match.homeTeam} vs ${analyses[0].match.awayTeam} as priority bet`);
    }
    
    if (userProfile.stats.winRate < 50) {
      actions.push('Focus on lower risk, higher probability bets');
    }
    
    actions.push('Review and adjust bankroll management strategy');
    
    return actions;
  }

  // Additional helper methods for calculations
  private static calculateAverageConfidence(tips: any[]): number {
    if (tips.length === 0) return 0;
    const total = tips.reduce((sum, tip) => sum + (tip.recommendations?.confidence || 0), 0);
    return Math.round(total / tips.length);
  }

  private static analyzeBetTypeDistribution(tips: any[]) {
    const distribution: Record<string, number> = {};
    tips.forEach(tip => {
      const betType = tip.recommendations?.primary?.betType || 'unknown';
      distribution[betType] = (distribution[betType] || 0) + 1;
    });
    return distribution;
  }

  private static analyzeLeagueDistribution(tips: any[]) {
    const distribution: Record<string, number> = {};
    tips.forEach(tip => {
      const league = tip.match?.league || 'unknown';
      distribution[league] = (distribution[league] || 0) + 1;
    });
    return distribution;
  }

  private static assessOverallRisk(tips: any[]): 'low' | 'medium' | 'high' {
    if (tips.length === 0) return 'medium';
    
    const avgConfidence = this.calculateAverageConfidence(tips);
    const highRiskTips = tips.filter(tip => (tip.recommendations?.confidence || 0) < 70).length;
    const riskRatio = highRiskTips / tips.length;
    
    if (avgConfidence > 80 && riskRatio < 0.2) return 'low';
    if (avgConfidence < 65 || riskRatio > 0.5) return 'high';
    return 'medium';
  }

  private static async generateKeyInsights(tips: any[]) {
    const insights = [];
    
    if (tips.length > 0) {
      const topTip = tips[0];
      insights.push(`Highest confidence tip: ${topTip.match} with ${topTip.recommendation?.confidence}% confidence`);
    }
    
    const avgConf = this.calculateAverageConfidence(tips);
    insights.push(`Average confidence across all tips: ${avgConf}%`);
    
    const betTypes = this.analyzeBetTypeDistribution(tips);
    const mostCommonBetType = Object.keys(betTypes).reduce((a, b) => betTypes[a] > betTypes[b] ? a : b, 'none');
    insights.push(`Most recommended bet type: ${mostCommonBetType}`);
    
    return insights;
  }

  private static generateOverallRecommendation(tips: any[]): string {
    if (tips.length === 0) {
      return 'No high-quality betting opportunities identified for today. Consider waiting for better opportunities.';
    }
    
    const avgConf = this.calculateAverageConfidence(tips);
    const riskLevel = this.assessOverallRisk(tips);
    
    if (avgConf > 80 && riskLevel === 'low') {
      return `Excellent day for betting with ${tips.length} high-confidence opportunities. Proceed with recommended stakes.`;
    } else if (avgConf > 70) {
      return `Good betting opportunities available. Consider selective betting on highest confidence tips.`;
    } else {
      return `Moderate opportunities today. Exercise caution and consider reducing stake sizes.`;
    }
  }

  private static extractKeyPoints(analysis: any): string[] {
    const points = [];
    
    if (analysis.insights?.dataPatterns) {
      points.push(...analysis.insights.dataPatterns.slice(0, 2));
    }
    
    if (analysis.predictions?.claude?.analysis) {
      // Extract key points from Claude analysis
      const claudePoints = analysis.predictions.claude.analysis
        .split('.')
        .filter((sentence: string) => sentence.length > 20)
        .slice(0, 2);
      points.push(...claudePoints);
    }
    
    return points.length > 0 ? points : ['Analysis based on comprehensive statistical and AI evaluation'];
  }

  private static calculateOverallQualityScore(tips: any[]): number {
    if (tips.length === 0) return 0;
    
    const avgConfidence = this.calculateAverageConfidence(tips);
    const dataQualityScore = tips.filter(tip => tip.insights?.dataQuality === 'high').length / tips.length * 100;
    
    return Math.round((avgConfidence + dataQualityScore) / 2);
  }

  private static adjustForUserRisk(analysis: any, riskLevel: string) {
    const baseConfidence = analysis.recommendations?.confidence || 0;
    
    if (riskLevel === 'low') {
      return Math.max(0, baseConfidence - 5); // More conservative
    } else if (riskLevel === 'high') {
      return Math.min(100, baseConfidence + 5); // More aggressive
    }
    
    return baseConfidence;
  }

  private static personalizeStakeSize(analysis: any, userProfile: any) {
    const baseStake = analysis.recommendations?.stakeSuggestion || 10;
    const userAvgStake = userProfile.stats?.avgStake || 10;
    
    // Blend recommendation with user's historical stake size
    return Math.round((baseStake + userAvgStake) / 2);
  }

  private static getAlternativesForUser(analysis: any, userProfile: any) {
    const alternatives = analysis.recommendations?.alternative || [];
    const userPreferredTypes = userProfile.preferences?.preferredBetTypes || [];
    
    // Filter alternatives to match user preferences
    return alternatives.filter((alt: any) => 
      userPreferredTypes.includes(alt.betType) || alt.confidence > 70
    );
  }

  private static generateUserSpecificWarnings(analysis: any, userProfile: any) {
    const warnings = [];
    
    if (userProfile.riskLevel === 'low' && analysis.recommendations?.confidence < 80) {
      warnings.push('This bet may be too risky for your conservative profile');
    }
    
    if (userProfile.stats?.winRate < 50 && analysis.recommendations?.confidence < 75) {
      warnings.push('Consider waiting for higher confidence opportunities to improve your win rate');
    }
    
    return warnings;
  }

  private static adjustConfidenceForUser(baseConfidence: number, userProfile: any): number {
    return this.adjustForUserRisk({ recommendations: { confidence: baseConfidence } }, userProfile.riskLevel);
  }

  private static calculatePersonalizedStake(baseStake: number, userProfile: any): number {
    return this.personalizeStakeSize({ recommendations: { stakeSuggestion: baseStake } }, userProfile);
  }

  private static async storeDailyTips(date: string, tips: any[], summary: any) {
    const query = `
      INSERT INTO daily_tips (date, tips, summary, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (date) DO UPDATE SET
        tips = $2,
        summary = $3,
        updated_at = CURRENT_TIMESTAMP
    `;

    try {
      await DatabaseService.query(query, [date, JSON.stringify(tips), JSON.stringify(summary)]);
    } catch (error) {
      console.error('Error storing daily tips:', error);
    }
  }

  private static async storePersonalizedTips(userId: string, tips: any) {
    const query = `
      INSERT INTO user_personalized_tips (user_id, tips, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
    `;

    try {
      await DatabaseService.query(query, [userId, JSON.stringify(tips)]);
    } catch (error) {
      console.error('Error storing personalized tips:', error);
    }
  }

  // Additional methods would be implemented for league-specific and bet-type-specific functionality
  // These are abbreviated for brevity but would follow similar patterns

  private static async getLeagueData(league: string, timeframe: string) {
    // Implementation for getting league-specific data
    return { matches: [], teams: [], oddsHistory: [] };
  }

  private static async generateLeagueTacticalAnalysis(league: string, data: any) {
    // Use Claude for tactical analysis specific to league
    return ClaudeApiService.generateTeamComparison('League Analysis', league, 'Tactical Overview');
  }

  private static async identifyLeagueOpportunities(data: any, trends: any) {
    // Implementation for identifying league opportunities
    return [];
  }

  private static identifyLeagueRisks(data: any) {
    // Implementation for identifying league-specific risks
    return ['Market volatility in league fixtures'];
  }

  private static generateLeagueRecommendations(data: any, trends: any) {
    // Implementation for generating league recommendations
    return ['Focus on home advantage patterns in this league'];
  }

  private static async getMatchesForBetType(betType: string, filters?: any) {
    // Implementation for getting matches suitable for specific bet type
    return [];
  }

  private static async getBetTypeHistoricalData(betType: string) {
    // Implementation for getting historical data for bet type
    return [];
  }

  private static async generateBetTypeSpecificAnalysis(match: any, betType: string) {
    // Implementation for bet type specific analysis
    return null;
  }

  private static calculateBetTypePerformance(data: any) {
    // Implementation for calculating bet type performance metrics
    return { winRate: 0, avgOdds: 2.0, profitability: 0 };
  }

  private static identifyBestBetTypeOpportunities(recommendations: any[]) {
    // Implementation for identifying best opportunities for specific bet type
    return recommendations.slice(0, 3);
  }

  private static getBetTypeRisks(betType: string, data: any) {
    // Implementation for identifying risks specific to bet type
    return [`${betType} bets carry inherent market risks`];
  }
}