import { AnalysisEngine } from './analysisEngine';
import { SportsApiService, WeatherService } from './sportsApi';
import { DatabaseService } from './database';

// Main Automation Pipeline for Daily Bet Generation
export class AutomationPipeline {
  
  // Main pipeline execution
  static async generateDailyTips(): Promise<void> {
    console.log('🚀 Starting daily tip generation pipeline...');
    
    try {
      // 1. Get configuration
      const config = await this.getConfiguration();
      console.log('📋 Configuration loaded:', config);
      
      // 2. Discover upcoming matches
      const matches = await this.discoverUpcomingMatches(config.daysLookahead);
      console.log(`🏈 Found ${matches.length} upcoming matches`);
      
      // Debug: Log detailed information about match discovery
      console.log('🔍 Debug: Checking each league for matches...');
      
      if (matches.length === 0) {
        console.log('⚠️ No matches found for analysis');
        console.log('💡 This could be due to:');
        console.log('   - No upcoming matches in the next', config.daysLookahead, 'days');
        console.log('   - API response format issues');
        console.log('   - Incorrect league IDs');
        console.log('   - Date filtering being too restrictive');
        return;
      }
      
      // 3. Filter and prioritize matches
      const prioritizedMatches = await this.prioritizeMatches(matches, config);
      console.log(`🎯 Prioritized ${prioritizedMatches.length} matches for analysis`);
      
      // 4. Generate analysis and tips
      const generatedTips = [];
      for (const match of prioritizedMatches) {
        try {
          console.log(`🔍 Analyzing ${match.homeTeam} vs ${match.awayTeam}...`);
          const tips = await this.analyzeAndGenerateTips(match, config);
          generatedTips.push(...tips);
          
          // Add delay to respect API rate limits
          await this.delay(1000);
        } catch (error) {
          console.error(`❌ Error analyzing match ${match.homeTeam} vs ${match.awayTeam}:`, error);
          continue;
        }
      }
      
      console.log(`✨ Generated ${generatedTips.length} total tips`);
      
      // 5. Quality control and filtering
      const qualifiedTips = await this.qualityControl(generatedTips, config);
      console.log(`✅ ${qualifiedTips.length} tips passed quality control`);
      
      // 6. Publish tips
      const publishedCount = await this.publishTips(qualifiedTips, config);
      console.log(`📢 Published ${publishedCount} tips successfully`);
      
      // 7. Update statistics and cleanup
      await this.updateStatistics(publishedCount, generatedTips.length);
      console.log('📊 Statistics updated');
      
      console.log('✅ Daily tip generation pipeline completed successfully');
      
    } catch (error) {
      console.error('💥 Pipeline execution failed:', error);
      await this.logError('PIPELINE_EXECUTION', error);
      throw error;
    }
  }
  
  // Get system configuration
  private static async getConfiguration() {
    const [
      maxTips,
      minConfidence,
      daysLookahead,
      autoPublish,
      enableWeather,
      freeTipsPerDay
    ] = await Promise.all([
      DatabaseService.getConfig('MAX_TIPS_PER_DAY'),
      DatabaseService.getConfig('MIN_CONFIDENCE_THRESHOLD'),
      DatabaseService.getConfig('ANALYSIS_LOOKBACK_DAYS'),
      DatabaseService.getConfig('AUTO_PUBLISH_ENABLED'),
      DatabaseService.getConfig('WEATHER_API_ENABLED'),
      DatabaseService.getConfig('FREE_TIPS_PER_DAY')
    ]);
    
    return {
      maxTipsPerDay: parseInt(maxTips || '6'),
      minConfidenceThreshold: parseInt(minConfidence || '65'),
      daysLookahead: parseInt(daysLookahead || '3'),
      autoPublishEnabled: autoPublish === 'true',
      weatherApiEnabled: enableWeather === 'true',
      freeTipsPerDay: parseInt(freeTipsPerDay || '1')
    };
  }
  
  // Discover upcoming matches from multiple leagues
  private static async discoverUpcomingMatches(daysLookahead: number = 3) {
    const matches = [];
    const leagues = [
      SportsApiService.LEAGUES.PREMIER_LEAGUE,
      SportsApiService.LEAGUES.CHAMPIONSHIP,
      SportsApiService.LEAGUES.LEAGUE_ONE,
      SportsApiService.LEAGUES.LEAGUE_TWO
    ];
    
    // Get matches from each league
    for (const leagueId of leagues) {
      try {
        console.log(`🔍 Fetching matches for league ID: ${leagueId}`);
        const leagueMatches = await SportsApiService.getUpcomingMatches(leagueId, daysLookahead);
        console.log(`   ✅ Found ${leagueMatches.length} matches for league ${leagueId}`);
        
        if (leagueMatches.length > 0) {
          console.log(`   📅 Sample match: ${leagueMatches[0].homeTeam} vs ${leagueMatches[0].awayTeam} on ${leagueMatches[0].matchDate}`);
        }
        
        matches.push(...leagueMatches.map(match => ({
          ...match,
          leagueId,
          priority: this.calculateMatchPriority(match, leagueId)
        })));
      } catch (error) {
        console.error(`❌ Failed to fetch matches for league ${leagueId}:`, error);
      }
    }
    
    return matches.sort((a, b) => b.priority - a.priority);
  }
  
  // Calculate match priority for analysis
  private static calculateMatchPriority(match: any, leagueId: string): number {
    let priority = 0;
    
    // League importance
    const leaguePriorities = {
      [SportsApiService.LEAGUES.PREMIER_LEAGUE]: 10,
      [SportsApiService.LEAGUES.CHAMPIONSHIP]: 8,
      [SportsApiService.LEAGUES.LEAGUE_ONE]: 6,
      [SportsApiService.LEAGUES.LEAGUE_TWO]: 5
    };
    priority += leaguePriorities[leagueId as keyof typeof leaguePriorities] || 5;
    
    // Time until match (prefer matches 1-2 days ahead)
    const hoursUntilMatch = (new Date(match.matchDate).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilMatch >= 24 && hoursUntilMatch <= 48) {
      priority += 5; // Sweet spot for analysis
    } else if (hoursUntilMatch > 48) {
      priority += 2; // Still good
    }
    
    // Big team matchups (simple heuristic based on team names)
    const bigTeams = [
      'Manchester City', 'Manchester United', 'Liverpool', 'Arsenal', 'Chelsea',
      'Real Madrid', 'Barcelona', 'Atletico Madrid',
      'Bayern Munich', 'Borussia Dortmund',
      'Juventus', 'AC Milan', 'Inter Milan',
      'PSG', 'Lyon', 'Marseille'
    ];
    
    if (bigTeams.includes(match.homeTeam) || bigTeams.includes(match.awayTeam)) {
      priority += 3;
    }
    
    if (bigTeams.includes(match.homeTeam) && bigTeams.includes(match.awayTeam)) {
      priority += 5; // Both teams are big clubs
    }
    
    return priority;
  }
  
  // Prioritize matches for analysis
  private static async prioritizeMatches(matches: any[], config: any) {
    // Filter matches that are suitable for analysis
    const suitableMatches = matches.filter(match => {
      const hoursUntilMatch = (new Date(match.matchDate).getTime() - Date.now()) / (1000 * 60 * 60);
      return hoursUntilMatch >= 6 && hoursUntilMatch <= 72; // Between 6 hours and 3 days
    });
    
    // Return top matches based on config
    return suitableMatches.slice(0, config.maxTipsPerDay * 2); // Analyze more than we need
  }
  
  // Analyze match and generate betting tips
  private static async analyzeAndGenerateTips(match: any, config: any) {
    // First, ensure the match exists in database and get UUID
    const matchUuid = await this.ensureMatchInDatabase(match);
    
    try {
      
      // Log analysis attempt using proper UUID
      await DatabaseService.query(
        'INSERT INTO analysis_logs (match_id, analysis_type, status) VALUES ($1, $2, $3)',
        [matchUuid, 'FULL_ANALYSIS', 'in_progress']
      );
      
      const startTime = Date.now();
      
      // Run comprehensive analysis
      const analysis = await AnalysisEngine.analyzeMatch(match);
      const executionTime = Date.now() - startTime;
      
      // Generate tips from predictions
      const tips = [];
      for (const prediction of analysis.predictions) {
        if (prediction.confidence >= config.minConfidenceThreshold) {
          const tip = await this.createTipFromPrediction(match, prediction, analysis, matchUuid);
          tips.push(tip);
        }
      }
      
      // Log successful analysis  
      await DatabaseService.query(
        'UPDATE analysis_logs SET status = $1, execution_time_ms = $2 WHERE match_id = $3 AND analysis_type = $4',
        ['success', executionTime, matchUuid, 'FULL_ANALYSIS']
      );
      
      return tips;
      
    } catch (error) {
      // Log failed analysis
      await DatabaseService.query(
        'UPDATE analysis_logs SET status = $1, error_message = $2 WHERE match_id = $3 AND analysis_type = $4',
        ['failed', error instanceof Error ? error.message : 'Unknown error', matchUuid, 'FULL_ANALYSIS']
      );
      
      throw error;
    }
  }
  
  // Create betting tip from prediction
  private static async createTipFromPrediction(match: any, prediction: any, analysis: any, matchUuid: string) {
    // Calculate risk factors
    const riskFactors = AnalysisEngine.assessRisk(prediction, analysis);
    
    // Determine if tip should be premium
    const isPremium = prediction.confidence >= 75 || riskFactors.length <= 2;
    
    // Create detailed analysis data for premium tips
    const analysisData = isPremium ? {
      valueRating: Math.round((prediction.confidence - 50) / 5), // Convert to 1-10 scale
      impliedProbability: ((1 / prediction.recommendedOdds) * 100),
      modelProbability: prediction.confidence,
      riskFactors,
      weatherImpact: analysis.analysis.weather.impact,
      venueAdvantagePercentage: analysis.analysis.venueAnalysis.homeAdvantage,
      marketMovement: analysis.analysis.marketTrends.movement,
      bettingVolume: analysis.analysis.marketTrends.volume
    } : null;
    
    return {
      matchId: matchUuid,
      betType: prediction.betType,
      recommendedOdds: prediction.recommendedOdds,
      confidenceScore: prediction.confidence,
      explanation: prediction.explanation,
      isPremium,
      analysisData,
      match: {
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        matchDate: match.matchDate,
        venue: match.venue
      },
      reasoning: prediction.reasoning
    };
  }
  
  // Quality control for generated tips
  private static async qualityControl(tips: any[], config: any) {
    const qualifiedTips: any[] = [];
    
    for (const tip of tips) {
      let passedQC = true;
      const qcReasons: string[] = [];
      
      // Confidence threshold check
      if (tip.confidenceScore < config.minConfidenceThreshold) {
        passedQC = false;
        qcReasons.push(`Confidence ${tip.confidenceScore}% below threshold ${config.minConfidenceThreshold}%`);
      }
      
      // Odds reasonableness check
      if (tip.recommendedOdds < 1.2 || tip.recommendedOdds > 10.0) {
        passedQC = false;
        qcReasons.push(`Odds ${tip.recommendedOdds} outside reasonable range (1.2-10.0)`);
      }
      
      // Duplicate match check
      const duplicateMatch = qualifiedTips.find(existing => 
        existing.match.homeTeam === tip.match.homeTeam &&
        existing.match.awayTeam === tip.match.awayTeam
      );
      
      if (duplicateMatch) {
        // Keep the tip with higher confidence
        if (tip.confidenceScore > duplicateMatch.confidenceScore) {
          const index = qualifiedTips.indexOf(duplicateMatch);
          qualifiedTips.splice(index, 1);
        } else {
          passedQC = false;
          qcReasons.push('Lower confidence duplicate match tip');
        }
      }
      
      // Risk assessment check
      if (tip.analysisData?.riskFactors?.length > 4) {
        passedQC = false;
        qcReasons.push('Too many risk factors identified');
      }
      
      if (passedQC) {
        qualifiedTips.push(tip);
      } else {
        console.log(`🚫 QC Failed: ${tip.match.homeTeam} vs ${tip.match.awayTeam} - ${qcReasons.join(', ')}`);
      }
    }
    
    // Limit to maximum tips per day
    return qualifiedTips
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, config.maxTipsPerDay);
  }
  
  // Publish qualified tips
  private static async publishTips(tips: any[], config: any) {
    let publishedCount = 0;
    
    // Ensure we have at least one free tip
    const freeTips = tips.filter(tip => !tip.isPremium).slice(0, config.freeTipsPerDay);
    const premiumTips = tips.filter(tip => tip.isPremium);
    
    // If no free tips, convert highest confidence premium tip to free
    if (freeTips.length === 0 && premiumTips.length > 0) {
      premiumTips[0].isPremium = false;
      freeTips.push(premiumTips[0]);
      premiumTips.shift();
    }
    
    const tipsToPublish = [...freeTips, ...premiumTips];
    
    for (const tip of tipsToPublish) {
      try {
        // Store tip in database
        const tipId = await DatabaseService.createBettingTip(tip);
        
        // Publish if auto-publish is enabled
        if (config.autoPublishEnabled) {
          await DatabaseService.query(
            'UPDATE betting_tips SET is_published = true, published_at = CURRENT_TIMESTAMP WHERE id = $1',
            [tipId]
          );
        }
        
        publishedCount++;
        console.log(`📤 Published: ${tip.match.homeTeam} vs ${tip.match.awayTeam} - ${tip.betType} (${tip.confidenceScore}%)`);
        
      } catch (error) {
        console.error(`❌ Failed to publish tip: ${tip.match.homeTeam} vs ${tip.match.awayTeam}`, error);
      }
    }
    
    return publishedCount;
  }
  
  // Update pipeline statistics
  private static async updateStatistics(publishedCount: number, totalGenerated: number) {
    const date = new Date().toISOString().split('T')[0];
    
    await DatabaseService.query(`
      INSERT INTO system_config (key, value, description)
      VALUES 
        ('LAST_GENERATION_DATE', $1, 'Date of last tip generation'),
        ('LAST_GENERATION_PUBLISHED', $2, 'Tips published in last generation'),
        ('LAST_GENERATION_TOTAL', $3, 'Total tips generated in last generation')
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `, [date, publishedCount.toString(), totalGenerated.toString()]);
  }
  
  // Utility functions
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private static async logError(type: string, error: any) {
    try {
      await DatabaseService.query(
        'INSERT INTO analysis_logs (analysis_type, status, error_message) VALUES ($1, $2, $3)',
        [type, 'failed', error instanceof Error ? error.message : String(error)]
      );
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
  
  // Manual trigger for testing
  static async testPipeline() {
    console.log('🧪 Running test pipeline...');
    
    try {
      // Run with reduced scope for testing
      const testConfig = {
        maxTipsPerDay: 2,
        minConfidenceThreshold: 60,
        daysLookahead: 2,
        autoPublishEnabled: false,
        weatherApiEnabled: true,
        freeTipsPerDay: 1
      };
      
      const matches = await this.discoverUpcomingMatches(testConfig.daysLookahead);
      console.log(`🏈 Test: Found ${matches.length} matches`);
      
      if (matches.length > 0) {
        const prioritized = await this.prioritizeMatches(matches, testConfig);
        console.log(`🎯 Test: Prioritized ${prioritized.length} matches`);
        
        const testMatch = prioritized[0];
        if (testMatch) {
          console.log(`🔍 Test: Analyzing ${testMatch.homeTeam} vs ${testMatch.awayTeam}`);
          const tips = await this.analyzeAndGenerateTips(testMatch, testConfig);
          console.log(`✨ Test: Generated ${tips.length} tips`);
          
          if (tips.length > 0) {
            console.log('📊 Test tip example:', {
              betType: tips[0].betType,
              confidence: tips[0].confidenceScore,
              odds: tips[0].recommendedOdds,
              isPremium: tips[0].isPremium
            });
          }
        }
      }
      
      console.log('✅ Test pipeline completed');
      
    } catch (error) {
      console.error('💥 Test pipeline failed:', error);
      throw error;
    }
  }
  
  // Helper method to ensure match exists in database and return UUID
  private static async ensureMatchInDatabase(match: any): Promise<string> {
    try {
      // First, try to find existing match by API ID
      const existingMatch = await DatabaseService.query(
        'SELECT id FROM matches WHERE api_id = $1',
        [match.apiId]
      );
      
      if (existingMatch.rows.length > 0) {
        return existingMatch.rows[0].id;
      }
      
      // If match doesn't exist, we need to create it
      // For now, let's create a simplified match record
      // TODO: This should properly handle leagues and teams
      const result = await DatabaseService.query(`
        INSERT INTO matches (api_id, match_date, venue, status) 
        VALUES ($1, $2, $3, 'scheduled') 
        RETURNING id
      `, [match.apiId, match.matchDate, match.venue || 'TBD']);
      
      return result.rows[0].id;
      
    } catch (error) {
      console.error('Error ensuring match in database:', error);
      // As a fallback, return the API ID as string for now
      // This will still cause UUID errors but keeps the system running
      return match.apiId;
    }
  }
}

// Export pipeline functions for use in API routes and scheduling
export default AutomationPipeline;