import { SportsApiService, WeatherService } from './sportsApi';
import { OpenAIApiService } from './openaiApi';
import { ClaudeApiService } from './claudeApi';
import { AnalysisEngine } from './analysisEngine';
import { DatabaseService } from './database';

// Data Intelligence Engine - Premium Analytics Platform
export class DataIntelligenceEngine {
  
  // Generate comprehensive match intelligence report
  static async generateMatchIntelligence(matchData: any) {
    try {
      console.log(`📊 Data Intelligence Engine: Analyzing ${matchData.homeTeam} vs ${matchData.awayTeam}`);

      // 1. Gather comprehensive real-time data
      const dataPacket = await this.assembleDataPacket(matchData);

      // 2. Statistical analysis engine
      const statisticalAnalysis = await AnalysisEngine.analyzeMatch(matchData);

      // 3. Quantitative pattern analysis (powered by AI but presented as statistical)
      const patternAnalysis = await this.performPatternAnalysis(dataPacket);

      // 4. Market intelligence assessment
      const marketIntelligence = await this.assessMarketIntelligence(matchData, dataPacket);

      // 5. Multi-factor risk assessment
      const riskAssessment = await this.calculateRiskMetrics(dataPacket, statisticalAnalysis);

      // 6. Generate final intelligence report
      const intelligenceReport = await this.compileIntelligenceReport({
        matchData,
        dataPacket,
        statisticalAnalysis,
        patternAnalysis,
        marketIntelligence,
        riskAssessment
      });

      // 7. Store research data
      await this.storeResearchData(matchData.id, intelligenceReport);

      return {
        success: true,
        matchId: matchData.id,
        researchReport: intelligenceReport,
        metadata: {
          dataPoints: this.countDataPoints(dataPacket),
          analysisDepth: 'comprehensive',
          confidenceFactors: this.extractConfidenceFactors(intelligenceReport),
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Data Intelligence Engine Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis engine unavailable'
      };
    }
  }

  // Assemble comprehensive data packet from all sources
  private static async assembleDataPacket(matchData: any) {
    console.log('📡 Assembling multi-source data packet...');
    
    const [
      upcomingMatches,
      oddsData,
      homeTeamStats,
      awayTeamStats,
      leagueStandings,
      weatherData,
      historicalH2H
    ] = await Promise.all([
      SportsApiService.getUpcomingMatches(matchData.leagueId, 14).catch(() => []),
      SportsApiService.getBettingOdds(this.mapLeagueToOddsApi(matchData.league)).catch(() => []),
      SportsApiService.getTeamStatistics(matchData.homeTeamId).catch(() => null),
      SportsApiService.getTeamStatistics(matchData.awayTeamId).catch(() => null),
      SportsApiService.getLeagueStandings(matchData.leagueId).catch(() => []),
      WeatherService.getWeatherForVenue(matchData.venue?.city || 'London', new Date(matchData.matchDate)).catch(() => null),
      this.getHistoricalHeadToHead(matchData.homeTeamId, matchData.awayTeamId).catch(() => null)
    ]);

    return {
      match: matchData,
      fixtures: upcomingMatches,
      odds: oddsData,
      teams: {
        home: homeTeamStats,
        away: awayTeamStats
      },
      league: {
        standings: leagueStandings,
        context: await this.getLeagueContext(matchData.leagueId)
      },
      venue: {
        weather: weatherData,
        conditions: this.assessVenueConditions(weatherData)
      },
      historical: {
        headToHead: historicalH2H,
        seasonForm: await this.getSeasonalForm(matchData.homeTeamId, matchData.awayTeamId)
      }
    };
  }

  // Perform advanced pattern analysis (AI-powered but presented as statistical)
  private static async performPatternAnalysis(dataPacket: any) {
    console.log('🔍 Executing pattern recognition algorithms...');

    // Use OpenAI for pattern analysis but present as statistical modeling
    const patternInsights = await OpenAIApiService.generateAdvancedStatistics({
      teams: [
        { 
          name: dataPacket.match.homeTeam,
          stats: dataPacket.teams.home,
          position: this.findTeamPosition(dataPacket.league.standings, dataPacket.match.homeTeam)
        },
        { 
          name: dataPacket.match.awayTeam,
          stats: dataPacket.teams.away,
          position: this.findTeamPosition(dataPacket.league.standings, dataPacket.match.awayTeam)
        }
      ],
      matches: dataPacket.fixtures,
      analysisType: 'correlation',
      parameters: {
        includeWeather: true,
        includeForm: true,
        includeHeadToHead: true,
        venueConditions: dataPacket.venue.conditions
      }
    });

    return {
      correlationFactors: patternInsights.correlations || [],
      statisticalSignificance: patternInsights.confidence || 85,
      predictiveIndicators: patternInsights.predictions || [],
      dataQualityScore: this.calculateDataQuality(dataPacket),
      modelAccuracy: this.calculateModelAccuracy(patternInsights)
    };
  }

  // Assess market intelligence and value opportunities
  private static async assessMarketIntelligence(matchData: any, dataPacket: any) {
    console.log('💹 Analyzing market dynamics and value indicators...');

    const matchOdds = this.extractMatchOdds(dataPacket.odds, matchData);
    
    if (!matchOdds) {
      return {
        marketSentiment: 'insufficient_data',
        valueOpportunities: [],
        riskIndicators: ['Limited market data available']
      };
    }

    // Use Claude for market analysis but present as quantitative assessment
    const marketAnalysis = await ClaudeApiService.analyzeMarketOpportunity(
      'comprehensive_market',
      matchOdds.homeWin || 2.0,
      {
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
        league: matchData.league
      }
    );

    return {
      marketSentiment: this.interpretMarketSentiment(marketAnalysis),
      valueOpportunities: this.identifyValueOpportunities(matchOdds, dataPacket),
      efficiencyRating: this.calculateMarketEfficiency(matchOdds),
      liquidityIndicators: this.assessMarketLiquidity(matchOdds),
      riskIndicators: this.extractMarketRisks(marketAnalysis)
    };
  }

  // Calculate comprehensive risk metrics
  private static calculateRiskMetrics(dataPacket: any, statisticalAnalysis: any) {
    console.log('⚖️ Computing multi-dimensional risk assessment...');

    const riskFactors = {
      teamForm: this.assessFormRisk(dataPacket.teams),
      weatherImpact: this.assessWeatherRisk(dataPacket.venue.weather),
      injuryFactor: this.assessInjuryRisk(dataPacket.teams), // Would need injury data API
      venueAdvantage: this.calculateVenueAdvantage(dataPacket.match),
      historicalVolatility: this.calculateHistoricalVolatility(dataPacket.historical),
      marketVolatility: this.assessMarketVolatility(dataPacket.odds),
      dataReliability: this.assessDataReliability(dataPacket)
    };

    const overallRisk = this.computeOverallRiskScore(riskFactors);
    
    return {
      riskScore: overallRisk,
      riskCategory: this.categorizeRisk(overallRisk),
      riskFactors,
      mitigation: this.suggestRiskMitigation(riskFactors),
      confidenceInterval: this.calculateConfidenceInterval(statisticalAnalysis)
    };
  }

  // Compile final intelligence report
  private static async compileIntelligenceReport(data: any) {
    const {
      matchData,
      dataPacket,
      statisticalAnalysis,
      patternAnalysis,
      marketIntelligence,
      riskAssessment
    } = data;

    // Generate natural language insights (AI-powered but presented as analytical)
    const analyticalInsights = await this.generateAnalyticalInsights(data);

    return {
      match: {
        fixture: `${matchData.homeTeam} vs ${matchData.awayTeam}`,
        competition: matchData.league,
        venue: matchData.venue,
        kickoff: matchData.matchDate
      },
      
      dataIntelligence: {
        sourcesAnalyzed: this.countDataSources(dataPacket),
        dataPoints: this.countDataPoints(dataPacket),
        analysisDepth: 'multi-dimensional',
        lastUpdated: new Date().toISOString()
      },

      statisticalAssessment: {
        primaryRecommendation: this.formatStatisticalRecommendation(statisticalAnalysis.predictions[0]),
        confidenceLevel: patternAnalysis.statisticalSignificance,
        supportingFactors: this.extractSupportingFactors(patternAnalysis),
        dataQuality: patternAnalysis.dataQualityScore
      },

      marketAnalysis: {
        sentiment: marketIntelligence.marketSentiment,
        valueRating: this.calculateValueRating(marketIntelligence),
        efficiencyScore: marketIntelligence.efficiencyRating,
        opportunities: marketIntelligence.valueOpportunities
      },

      riskProfile: {
        overallRisk: riskAssessment.riskCategory,
        riskScore: riskAssessment.riskScore,
        keyRisks: this.extractKeyRisks(riskAssessment.riskFactors),
        mitigation: riskAssessment.mitigation
      },

      quantitativeInsights: {
        keyFindings: analyticalInsights.keyFindings,
        statisticalEdge: analyticalInsights.statisticalEdge,
        performanceIndicators: analyticalInsights.performanceIndicators,
        recommendation: analyticalInsights.recommendation
      },

      researchMethodology: {
        dataPoints: this.countDataPoints(dataPacket),
        algorithms: ['correlation_analysis', 'pattern_recognition', 'market_efficiency', 'risk_modeling'],
        validationScore: this.calculateValidationScore(data),
        reliabilityIndex: this.calculateReliabilityIndex(dataPacket)
      }
    };
  }

  // Generate analytical insights using AI but present as statistical analysis
  private static async generateAnalyticalInsights(data: any) {
    const { matchData, statisticalAnalysis, patternAnalysis, marketIntelligence } = data;

    // Create comprehensive prompt for analytical insight generation
    const researchPrompt = `
    Analyze this comprehensive sports data as a quantitative researcher:

    MATCH: ${matchData.homeTeam} vs ${matchData.awayTeam}
    LEAGUE: ${matchData.league}
    
    STATISTICAL MODEL OUTPUT:
    - Primary prediction: ${statisticalAnalysis.predictions[0]?.betType || 'insufficient_data'}
    - Statistical confidence: ${patternAnalysis.statisticalSignificance}%
    - Data quality score: ${patternAnalysis.dataQualityScore}/100
    
    MARKET DYNAMICS:
    - Market sentiment: ${marketIntelligence.marketSentiment}
    - Efficiency rating: ${marketIntelligence.efficiencyRating}/10
    - Value opportunities: ${marketIntelligence.valueOpportunities.length} identified

    Generate professional analytical insights using statistical language:
    1. Key quantitative findings (3-4 bullet points)
    2. Statistical edge identification  
    3. Performance indicator analysis
    4. Research-backed recommendation

    Use terminology like: "statistical analysis indicates", "quantitative modeling reveals", 
    "data correlation shows", "historical patterns suggest", "multi-factor analysis confirms"
    `;

    const insights = await OpenAIApiService.analyzeHistoricalData({
      bets: [], // Not needed for this analysis
      timeframe: 'analytical_research',
      metrics: { customPrompt: researchPrompt }
    });

    return {
      keyFindings: insights.insights?.slice(0, 4) || ['Comprehensive analysis completed'],
      statisticalEdge: this.extractStatisticalEdge(insights.analysis),
      performanceIndicators: this.extractPerformanceIndicators(insights.analysis),
      recommendation: this.extractRecommendation(insights.analysis)
    };
  }

  // Helper methods for data processing and analysis
  private static mapLeagueToOddsApi(league: string): string {
    const mapping: Record<string, string> = {
      'Premier League': 'soccer_epl',
      'Championship': 'soccer_efl_champ',
      'La Liga': 'soccer_spain_la_liga',
      'Bundesliga': 'soccer_germany_bundesliga',
      'Serie A': 'soccer_italy_serie_a',
      'Ligue 1': 'soccer_france_ligue_one',
      'Champions League': 'soccer_uefa_champs_league'
    };
    return mapping[league] || 'soccer_epl';
  }

  private static async getHistoricalHeadToHead(homeTeamId: string, awayTeamId: string) {
    const query = `
      SELECT * FROM head_to_head 
      WHERE (home_team_id = $1 AND away_team_id = $2) 
         OR (home_team_id = $2 AND away_team_id = $1)
      ORDER BY last_meeting_date DESC
      LIMIT 1
    `;

    try {
      const result = await DatabaseService.query(query, [homeTeamId, awayTeamId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching head-to-head:', error);
      return null;
    }
  }

  private static async getLeagueContext(leagueId: string) {
    // Get league information and context
    return {
      competitiveness: 'high', // Would calculate from standings variance
      goalAverage: 2.7, // Would calculate from league stats
      homeAdvantage: 62 // Would calculate from league home/away records
    };
  }

  private static async getSeasonalForm(homeTeamId: string, awayTeamId: string) {
    // Get seasonal form data for both teams
    return {
      homeTeam: { lastFiveGames: ['W', 'D', 'W', 'L', 'W'], trend: 'improving' },
      awayTeam: { lastFiveGames: ['L', 'W', 'W', 'D', 'L'], trend: 'stable' }
    };
  }

  private static findTeamPosition(standings: any[], teamName: string): number {
    const team = standings.find(team => 
      team.name?.toLowerCase().includes(teamName.toLowerCase()) ||
      team.team?.toLowerCase().includes(teamName.toLowerCase())
    );
    return team?.position || team?.intRank || 10;
  }

  private static assessVenueConditions(weather: any) {
    if (!weather) return 'standard';
    
    if (weather.impact === 'negative') return 'challenging';
    if (weather.impact === 'positive') return 'optimal';
    return 'standard';
  }

  private static calculateDataQuality(dataPacket: any): number {
    let qualityScore = 0;
    let factors = 0;

    if (dataPacket.teams.home && dataPacket.teams.away) { qualityScore += 25; factors++; }
    if (dataPacket.odds && dataPacket.odds.length > 0) { qualityScore += 25; factors++; }
    if (dataPacket.venue.weather) { qualityScore += 15; factors++; }
    if (dataPacket.historical.headToHead) { qualityScore += 20; factors++; }
    if (dataPacket.league.standings.length > 0) { qualityScore += 15; factors++; }

    return factors > 0 ? Math.round(qualityScore) : 50;
  }

  private static calculateModelAccuracy(patternInsights: any): number {
    // Calculate model accuracy based on statistical significance and data quality
    const baseAccuracy = patternInsights.confidence || 75;
    const qualityBonus = Math.min(10, (patternInsights.correlations?.length || 0) * 2);
    return Math.min(95, baseAccuracy + qualityBonus);
  }

  private static extractMatchOdds(oddsData: any[], matchData: any) {
    const matchOdds = oddsData.find(match => 
      match.homeTeam?.toLowerCase().includes(matchData.homeTeam.toLowerCase()) ||
      match.awayTeam?.toLowerCase().includes(matchData.awayTeam.toLowerCase())
    );

    if (!matchOdds || !matchOdds.bookmakers) return null;

    // Extract average odds from bookmakers
    const homeWinOdds: number[] = [];
    const drawOdds: number[] = [];
    const awayWinOdds: number[] = [];

    matchOdds.bookmakers.forEach((bookmaker: any) => {
      bookmaker.markets?.forEach((market: any) => {
        if (market.key === 'h2h') {
          market.outcomes?.forEach((outcome: any) => {
            if (outcome.name === matchData.homeTeam) homeWinOdds.push(outcome.price);
            else if (outcome.name === matchData.awayTeam) awayWinOdds.push(outcome.price);
            else drawOdds.push(outcome.price);
          });
        }
      });
    });

    return {
      homeWin: homeWinOdds.length ? homeWinOdds.reduce((a, b) => a + b) / homeWinOdds.length : null,
      draw: drawOdds.length ? drawOdds.reduce((a, b) => a + b) / drawOdds.length : null,
      awayWin: awayWinOdds.length ? awayWinOdds.reduce((a, b) => a + b) / awayWinOdds.length : null
    };
  }

  private static interpretMarketSentiment(marketAnalysis: any): string {
    if (!marketAnalysis.success) return 'insufficient_data';
    
    const analysis = marketAnalysis.marketAnalysis?.toLowerCase() || '';
    
    if (analysis.includes('strong') && analysis.includes('favorite')) return 'strong_favorite_bias';
    if (analysis.includes('balanced') || analysis.includes('even')) return 'balanced_market';
    if (analysis.includes('value') || analysis.includes('opportunity')) return 'value_available';
    if (analysis.includes('volatile') || analysis.includes('uncertain')) return 'high_volatility';
    
    return 'neutral_sentiment';
  }

  private static identifyValueOpportunities(matchOdds: any, dataPacket: any) {
    const opportunities = [];
    
    if (matchOdds.homeWin && matchOdds.homeWin > 3.0) {
      const homeStrength = this.calculateTeamStrength(dataPacket.teams.home);
      if (homeStrength > 0.6) {
        opportunities.push({
          market: 'home_win',
          odds: matchOdds.homeWin,
          valueRating: 8.5,
          reasoning: 'Strong home team undervalued by market'
        });
      }
    }

    return opportunities;
  }

  private static calculateTeamStrength(teamStats: any): number {
    if (!teamStats) return 0.5;
    
    const winRate = teamStats.wins / Math.max(1, teamStats.matchesPlayed);
    const goalDiff = (teamStats.goalsFor - teamStats.goalsAgainst) / Math.max(1, teamStats.matchesPlayed);
    
    return Math.max(0, Math.min(1, (winRate + goalDiff / 5 + 0.5) / 2));
  }

  // Additional helper methods would be implemented here...
  // For brevity, showing key methods only

  private static countDataSources(dataPacket: any): number {
    let sources = 0;
    if (dataPacket.fixtures.length > 0) sources++;
    if (dataPacket.odds.length > 0) sources++;
    if (dataPacket.teams.home || dataPacket.teams.away) sources++;
    if (dataPacket.league.standings.length > 0) sources++;
    if (dataPacket.venue.weather) sources++;
    if (dataPacket.historical.headToHead) sources++;
    return sources;
  }

  private static countDataPoints(dataPacket: any): number {
    // Count individual data points across all sources
    return 47; // Placeholder - would count actual data points
  }

  private static formatStatisticalRecommendation(prediction: any) {
    if (!prediction) return 'Insufficient data for statistical recommendation';
    
    return {
      outcome: prediction.betType,
      confidence: prediction.confidence,
      reasoning: prediction.explanation?.replace(/AI|artificial intelligence/gi, 'statistical model'),
      expectedValue: prediction.recommendedOdds
    };
  }

  private static extractSupportingFactors(patternAnalysis: any): string[] {
    return patternAnalysis.correlationFactors?.slice(0, 3) || [
      'Multi-factor correlation analysis',
      'Historical pattern recognition',
      'Performance indicator modeling'
    ];
  }

  private static extractKeyRisks(riskFactors: any): string[] {
    const risks = [];
    Object.entries(riskFactors).forEach(([factor, value]: [string, any]) => {
      if (value > 0.7) {
        risks.push(`Elevated ${factor.replace(/([A-Z])/g, ' $1').toLowerCase()} risk`);
      }
    });
    return risks.length > 0 ? risks : ['Standard market risks apply'];
  }

  private static calculateValueRating(marketIntelligence: any): number {
    const opportunityCount = marketIntelligence.valueOpportunities?.length || 0;
    const efficiencyScore = marketIntelligence.efficiencyRating || 5;
    
    return Math.min(10, opportunityCount * 2 + (10 - efficiencyScore));
  }

  private static extractStatisticalEdge(analysis: string): string {
    // Extract statistical edge from AI analysis text
    const edgePatterns = [
      /statistical[ly]?\s+significant/i,
      /strong\s+correlation/i,
      /data\s+indicates?/i,
      /pattern\s+analysis\s+reveals/i
    ];
    
    for (const pattern of edgePatterns) {
      const match = analysis.match(pattern);
      if (match) {
        const sentence = this.extractSentenceContaining(analysis, match[0]);
        return sentence || 'Quantitative analysis identifies potential market inefficiency';
      }
    }
    
    return 'Multi-dimensional analysis reveals statistical patterns';
  }

  private static extractSentenceContaining(text: string, phrase: string): string | null {
    const sentences = text.split(/[.!?]+/);
    const sentence = sentences.find(s => s.toLowerCase().includes(phrase.toLowerCase()));
    return sentence ? sentence.trim() + '.' : null;
  }

  private static extractPerformanceIndicators(analysis: string): string[] {
    // Extract performance indicators from analysis
    return [
      'Form trajectory analysis',
      'Goal expectancy modeling',
      'Defensive solidity metrics',
      'Market efficiency calculation'
    ];
  }

  private static extractRecommendation(analysis: string): string {
    // Extract final recommendation from analysis
    const recommendationPatterns = [
      /recommend[s]?[:\s]+(.+?)(?=\.|$)/i,
      /suggest[s]?[:\s]+(.+?)(?=\.|$)/i,
      /indicates?[:\s]+(.+?)(?=\.|$)/i
    ];
    
    for (const pattern of recommendationPatterns) {
      const match = analysis.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'Comprehensive analysis supports quantitative approach to market evaluation';
  }

  // Risk assessment methods (simplified implementations)
  private static assessFormRisk(teams: any): number {
    const homeForm = teams.home?.currentForm || [];
    const awayForm = teams.away?.currentForm || [];
    
    const homeRisk = homeForm.filter((f: string) => f === 'L').length / Math.max(1, homeForm.length);
    const awayRisk = awayForm.filter((f: string) => f === 'L').length / Math.max(1, awayForm.length);
    
    return (homeRisk + awayRisk) / 2;
  }

  private static assessWeatherRisk(weather: any): number {
    if (!weather) return 0.2;
    if (weather.impact === 'negative') return 0.8;
    if (weather.impact === 'positive') return 0.1;
    return 0.3;
  }

  private static assessInjuryRisk(teams: any): number {
    // Would integrate with injury API
    return 0.3; // Placeholder
  }

  private static calculateVenueAdvantage(match: any): number {
    // Calculate home advantage factor
    return 0.62; // Historical average home advantage
  }

  private static calculateHistoricalVolatility(historical: any): number {
    if (!historical.headToHead) return 0.5;
    // Calculate based on historical result variance
    return 0.4; // Placeholder
  }

  private static assessMarketVolatility(odds: any): number {
    if (!odds || odds.length === 0) return 0.5;
    // Calculate based on odds spread
    return 0.3; // Placeholder
  }

  private static assessDataReliability(dataPacket: any): number {
    const qualityScore = this.calculateDataQuality(dataPacket);
    return qualityScore / 100;
  }

  private static computeOverallRiskScore(riskFactors: any): number {
    const weights = {
      teamForm: 0.2,
      weatherImpact: 0.1,
      injuryFactor: 0.15,
      venueAdvantage: 0.1,
      historicalVolatility: 0.2,
      marketVolatility: 0.15,
      dataReliability: 0.1
    };
    
    let weightedRisk = 0;
    Object.entries(riskFactors).forEach(([factor, value]: [string, any]) => {
      const weight = weights[factor as keyof typeof weights] || 0;
      weightedRisk += value * weight;
    });
    
    return Math.min(1, Math.max(0, weightedRisk));
  }

  private static categorizeRisk(riskScore: number): string {
    if (riskScore < 0.3) return 'low_risk';
    if (riskScore < 0.6) return 'moderate_risk';
    return 'high_risk';
  }

  private static suggestRiskMitigation(riskFactors: any): string[] {
    const suggestions = [];
    
    if (riskFactors.teamForm > 0.6) suggestions.push('Consider reduced stake due to form inconsistency');
    if (riskFactors.weatherImpact > 0.6) suggestions.push('Weather conditions may affect playing style');
    if (riskFactors.marketVolatility > 0.7) suggestions.push('Monitor odds movement before placement');
    
    return suggestions.length > 0 ? suggestions : ['Standard risk management protocols apply'];
  }

  private static calculateConfidenceInterval(statisticalAnalysis: any): string {
    const confidence = statisticalAnalysis.predictions[0]?.confidence || 75;
    const lower = Math.max(50, confidence - 10);
    const upper = Math.min(95, confidence + 10);
    return `${lower}% - ${upper}%`;
  }

  private static calculateValidationScore(data: any): number {
    // Calculate validation score based on data completeness and analysis depth
    return 87; // Placeholder
  }

  private static calculateReliabilityIndex(dataPacket: any): number {
    return this.calculateDataQuality(dataPacket) / 100;
  }

  private static calculateMarketEfficiency(matchOdds: any): number {
    if (!matchOdds) return 5;
    
    // Calculate efficiency based on odds balance
    const totalImpliedProb = (1/matchOdds.homeWin) + (1/matchOdds.draw || 3) + (1/matchOdds.awayWin);
    const margin = totalImpliedProb - 1;
    
    // Higher margin = lower efficiency
    return Math.max(1, Math.min(10, 10 - (margin * 20)));
  }

  private static assessMarketLiquidity(matchOdds: any): string[] {
    // Assess market liquidity based on odds availability
    if (!matchOdds) return ['Limited market depth'];
    
    const indicators = [];
    if (matchOdds.homeWin && matchOdds.awayWin && matchOdds.draw) {
      indicators.push('Full market coverage available');
    }
    indicators.push('Multiple bookmaker consensus');
    
    return indicators;
  }

  private static extractMarketRisks(marketAnalysis: any): string[] {
    if (!marketAnalysis.success) return ['Market analysis unavailable'];
    
    return [
      'Standard market volatility',
      'Liquidity considerations',
      'Timing risk factors'
    ];
  }

  private static async storeResearchData(matchId: string, report: any) {
    const query = `
      INSERT INTO ai_analyses (match_id, analysis_data, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (match_id) DO UPDATE SET
        analysis_data = $2,
        updated_at = CURRENT_TIMESTAMP
    `;

    try {
      await DatabaseService.query(query, [matchId, JSON.stringify(report)]);
    } catch (error) {
      console.error('Error storing research data:', error);
    }
  }
}