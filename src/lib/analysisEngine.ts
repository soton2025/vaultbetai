import { DatabaseService } from './database';
import { SportsApiService, WeatherService } from './sportsApi';

// Statistical Analysis Engine for Automated Bet Generation
export class AnalysisEngine {
  
  // Main analysis function for a match
  static async analyzeMatch(matchData: any) {
    try {
      const analysis = {
        matchId: matchData.id,
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
        league: matchData.league,
        matchDate: new Date(matchData.matchDate),
        predictions: [] as any[],
        analysis: {} as any
      };

      // 1. Gather all data sources
      const [homeStats, awayStats, headToHead, weather, odds] = await Promise.all([
        this.getTeamAnalysis(matchData.homeTeamId),
        this.getTeamAnalysis(matchData.awayTeamId),
        this.getHeadToHeadAnalysis(matchData.homeTeamId, matchData.awayTeamId),
        WeatherService.getWeatherForVenue(matchData.venue?.city || 'London', analysis.matchDate),
        this.getMarketAnalysis(matchData.apiId)
      ]);

      // 2. Build comprehensive analysis
      analysis.analysis = {
        teamStats: { home: homeStats, away: awayStats },
        headToHead,
        weather,
        marketTrends: odds,
        venueAnalysis: await this.getVenueAnalysis(matchData.venue, matchData.homeTeamId)
      };

      // 3. Generate predictions for different bet types
      analysis.predictions = await this.generatePredictions(analysis);

      return analysis;

    } catch (error) {
      console.error('Error analyzing match:', error);
      throw error;
    }
  }

  // Get comprehensive team analysis
  private static async getTeamAnalysis(teamId: string) {
    // Get recent form and statistics
    const stats = await SportsApiService.getTeamStatistics(teamId);
    
    if (!stats) {
      return {
        form: [],
        goalsPerGame: 0,
        goalsAgainstPerGame: 0,
        cleanSheets: 0,
        bttsPercentage: 0,
        homeAdvantage: 0
      };
    }

    return {
      form: stats.currentForm,
      goalsPerGame: stats.matchesPlayed > 0 ? stats.goalsFor / stats.matchesPlayed : 0,
      goalsAgainstPerGame: stats.matchesPlayed > 0 ? stats.goalsAgainst / stats.matchesPlayed : 0,
      cleanSheets: this.calculateCleanSheets(stats.recentGoalsConceded),
      bttsPercentage: this.calculateBTTSPercentage(stats.recentGoalsScored, stats.recentGoalsConceded),
      homeAdvantage: this.calculateHomeAdvantage(stats),
      recentGoalsScored: stats.recentGoalsScored,
      recentGoalsConceded: stats.recentGoalsConceded,
      wins: stats.wins,
      draws: stats.draws,
      losses: stats.losses
    };
  }

  // Calculate clean sheets percentage
  private static calculateCleanSheets(goalsConceded: number[]) {
    const cleanSheets = goalsConceded.filter(goals => goals === 0).length;
    return goalsConceded.length > 0 ? (cleanSheets / goalsConceded.length) * 100 : 0;
  }

  // Calculate Both Teams To Score percentage
  private static calculateBTTSPercentage(goalsScored: number[], goalsConceded: number[]) {
    let bttsCount = 0;
    const matches = Math.min(goalsScored.length, goalsConceded.length);
    
    for (let i = 0; i < matches; i++) {
      if (goalsScored[i] > 0 && goalsConceded[i] > 0) {
        bttsCount++;
      }
    }
    
    return matches > 0 ? (bttsCount / matches) * 100 : 0;
  }

  // Calculate home advantage
  private static calculateHomeAdvantage(stats: any) {
    const homePoints = (stats.homeWins * 3) + stats.homeDraws;
    const awayPoints = (stats.awayWins * 3) + stats.awayDraws;
    const totalHomeGames = stats.homeWins + stats.homeDraws + stats.homeLosses;
    const totalAwayGames = stats.awayWins + stats.awayDraws + stats.awayLosses;
    
    if (totalHomeGames === 0 || totalAwayGames === 0) return 50;
    
    const homePPG = homePoints / totalHomeGames;
    const awayPPG = awayPoints / totalAwayGames;
    
    return Math.min(100, Math.max(0, 50 + ((homePPG - awayPPG) * 10)));
  }

  // Get head-to-head analysis
  private static async getHeadToHeadAnalysis(homeTeamId: string, awayTeamId: string) {
    const query = `
      SELECT * FROM head_to_head 
      WHERE home_team_id = $1 AND away_team_id = $2
    `;
    
    try {
      const result = await DatabaseService.query(query, [homeTeamId, awayTeamId]);
      const h2h = result.rows[0];
      
      if (!h2h) {
        return {
          totalMeetings: 0,
          homeWins: 0,
          awayWins: 0,
          draws: 0,
          homeWinPercentage: 33,
          awayWinPercentage: 33,
          drawPercentage: 34
        };
      }
      
      return {
        totalMeetings: h2h.total_meetings,
        homeWins: h2h.home_wins,
        awayWins: h2h.away_wins,
        draws: h2h.draws,
        homeWinPercentage: (h2h.home_wins / h2h.total_meetings) * 100,
        awayWinPercentage: (h2h.away_wins / h2h.total_meetings) * 100,
        drawPercentage: (h2h.draws / h2h.total_meetings) * 100,
        lastMeeting: {
          date: h2h.last_meeting_date,
          score: h2h.last_meeting_score,
          result: h2h.last_meeting_result
        }
      };
    } catch (error) {
      console.error('Error fetching head-to-head:', error);
      return {
        totalMeetings: 0,
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        homeWinPercentage: 33,
        awayWinPercentage: 33,
        drawPercentage: 34
      };
    }
  }

  // Get market analysis (odds movements, betting volumes)
  private static async getMarketAnalysis(matchApiId: string) {
    // TODO: Implement odds tracking and movement analysis
    // For now, return simulated market data
    return {
      volume: 'medium',
      movement: 'stable',
      publicMoney: 'balanced',
      sharpMoney: 'home',
      valueOpportunities: ['over_2_5_goals']
    };
  }

  // Venue analysis
  private static async getVenueAnalysis(venue: any, homeTeamId: string) {
    return {
      name: venue?.name || 'Unknown',
      capacity: venue?.capacity || 50000,
      homeAdvantage: 65, // Default home advantage percentage
      weatherImpact: 'neutral'
    };
  }

  // Generate betting predictions
  private static async generatePredictions(analysis: any) {
    const predictions = [];
    
    // 1. Match Result Prediction
    const matchResult = this.predictMatchResult(analysis);
    if (matchResult.confidence >= 65) {
      predictions.push(matchResult);
    }
    
    // 2. Over/Under Goals Prediction
    const totalGoals = this.predictTotalGoals(analysis);
    if (totalGoals.confidence >= 65) {
      predictions.push(totalGoals);
    }
    
    // 3. Both Teams To Score Prediction
    const btts = this.predictBothTeamsToScore(analysis);
    if (btts.confidence >= 65) {
      predictions.push(btts);
    }
    
    // Return only the highest confidence prediction
    return predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 1);
  }

  // Predict match result (Home Win, Draw, Away Win)
  private static predictMatchResult(analysis: any) {
    const homeStats = analysis.analysis.teamStats.home;
    const awayStats = analysis.analysis.teamStats.away;
    const h2h = analysis.analysis.headToHead;
    
    // Calculate team strengths
    const homeStrength = this.calculateTeamStrength(homeStats, true);
    const awayStrength = this.calculateTeamStrength(awayStats, false);
    
    // Head-to-head influence
    const h2hInfluence = h2h.totalMeetings > 0 ? 
      (h2h.homeWinPercentage - h2h.awayWinPercentage) / 100 : 0;
    
    // Final prediction calculation
    const strengthDiff = homeStrength - awayStrength + (h2hInfluence * 0.1);
    
    let prediction = 'draw';
    let confidence = 50;
    
    if (strengthDiff > 0.15) {
      prediction = 'home_win';
      confidence = Math.min(95, 50 + (strengthDiff * 200));
    } else if (strengthDiff < -0.15) {
      prediction = 'away_win';
      confidence = Math.min(95, 50 + (Math.abs(strengthDiff) * 200));
    } else {
      confidence = 60 - (Math.abs(strengthDiff) * 100);
    }
    
    return {
      betType: prediction,
      confidence: Math.round(confidence),
      explanation: this.generateMatchResultExplanation(analysis, strengthDiff),
      recommendedOdds: this.estimateOdds(prediction, confidence),
      reasoning: {
        homeStrength: homeStrength.toFixed(3),
        awayStrength: awayStrength.toFixed(3),
        strengthDiff: strengthDiff.toFixed(3),
        h2hInfluence: h2hInfluence.toFixed(3)
      }
    };
  }

  // Calculate team strength score
  private static calculateTeamStrength(stats: any, isHome: boolean) {
    let strength = 0.5; // Base strength
    
    // Form analysis (recent 5 matches)
    const formScore = this.calculateFormScore(stats.form);
    strength += (formScore - 0.5) * 0.3;
    
    // Goal statistics
    const goalRatio = stats.goalsPerGame / (stats.goalsAgainstPerGame + 1);
    strength += (goalRatio - 1) * 0.2;
    
    // Home advantage
    if (isHome) {
      strength += (stats.homeAdvantage - 50) / 100 * 0.2;
    }
    
    return Math.max(0, Math.min(1, strength));
  }

  // Calculate form score from recent results
  private static calculateFormScore(form: string[]) {
    if (form.length === 0) return 0.5;
    
    let score = 0;
    const weights = [0.4, 0.3, 0.2, 0.1, 0.05]; // Recent matches weighted more
    
    form.slice(0, 5).forEach((result, index) => {
      const weight = weights[index] || 0.05;
      if (result === 'W') score += 1 * weight;
      else if (result === 'D') score += 0.5 * weight;
    });
    
    return score / weights.slice(0, form.length).reduce((a, b) => a + b, 0);
  }

  // Predict total goals (Over/Under 2.5)
  private static predictTotalGoals(analysis: any) {
    const homeStats = analysis.analysis.teamStats.home;
    const awayStats = analysis.analysis.teamStats.away;
    
    const avgGoalsHome = homeStats.goalsPerGame;
    const avgGoalsAway = awayStats.goalsPerGame;
    const expectedGoals = avgGoalsHome + avgGoalsAway;
    
    // Weather impact
    let weatherMultiplier = 1;
    if (analysis.analysis.weather.impact === 'negative') {
      weatherMultiplier = 0.85; // Reduce expected goals in bad weather
    }
    
    const adjustedExpected = expectedGoals * weatherMultiplier;
    const prediction = adjustedExpected > 2.5 ? 'over_2_5_goals' : 'under_2_5_goals';
    
    // Confidence based on how far from 2.5 the prediction is
    const distance = Math.abs(adjustedExpected - 2.5);
    const confidence = Math.min(95, 50 + (distance * 30));
    
    return {
      betType: prediction,
      confidence: Math.round(confidence),
      explanation: this.generateGoalsExplanation(analysis, adjustedExpected),
      recommendedOdds: this.estimateOdds(prediction, confidence),
      reasoning: {
        homeGoalsPerGame: avgGoalsHome.toFixed(2),
        awayGoalsPerGame: avgGoalsAway.toFixed(2),
        expectedGoals: adjustedExpected.toFixed(2),
        weatherImpact: analysis.analysis.weather.impact
      }
    };
  }

  // Predict Both Teams To Score
  private static predictBothTeamsToScore(analysis: any) {
    const homeStats = analysis.analysis.teamStats.home;
    const awayStats = analysis.analysis.teamStats.away;
    
    const homeBttsRate = homeStats.bttsPercentage;
    const awayBttsRate = awayStats.bttsPercentage;
    const avgBttsRate = (homeBttsRate + awayBttsRate) / 2;
    
    const homeCleanSheets = homeStats.cleanSheets;
    const awayCleanSheets = awayStats.cleanSheets;
    const avgCleanSheets = (homeCleanSheets + awayCleanSheets) / 2;
    
    // BTTS more likely if both teams score regularly and concede regularly
    const bttsLikelihood = (avgBttsRate + (100 - avgCleanSheets)) / 2;
    
    const prediction = bttsLikelihood > 50 ? 'btts' : 'btts_no';
    const confidence = Math.min(95, Math.max(50, Math.abs(bttsLikelihood - 50) + 50));
    
    return {
      betType: prediction,
      confidence: Math.round(confidence),
      explanation: this.generateBttsExplanation(analysis, bttsLikelihood),
      recommendedOdds: this.estimateOdds(prediction, confidence),
      reasoning: {
        homeBttsRate: homeBttsRate.toFixed(1),
        awayBttsRate: awayBttsRate.toFixed(1),
        homeCleanSheets: homeCleanSheets.toFixed(1),
        awayCleanSheets: awayCleanSheets.toFixed(1),
        bttsLikelihood: bttsLikelihood.toFixed(1)
      }
    };
  }

  // Generate explanations for predictions
  private static generateMatchResultExplanation(analysis: any, strengthDiff: number) {
    const homeTeam = analysis.homeTeam;
    const awayTeam = analysis.awayTeam;
    const homeStats = analysis.analysis.teamStats.home;
    const awayStats = analysis.analysis.teamStats.away;
    
    const explanations = [];
    
    if (strengthDiff > 0.15) {
      explanations.push(`${homeTeam} shows superior form with ${homeStats.form.filter((f: string) => f === 'W').length} wins in their last 5 matches`);
      explanations.push(`Home advantage at their venue provides additional edge`);
    } else if (strengthDiff < -0.15) {
      explanations.push(`${awayTeam} has been in excellent form away from home`);
      explanations.push(`Their attacking prowess (${awayStats.goalsPerGame.toFixed(1)} goals per game) gives them the edge`);
    } else {
      explanations.push(`Both teams are evenly matched based on recent form and statistics`);
      explanations.push(`Expect a closely contested match with potential for a draw`);
    }
    
    if (analysis.analysis.weather.impact === 'negative') {
      explanations.push(`Weather conditions may favor defensive play`);
    }
    
    return explanations.join('. ') + '.';
  }

  private static generateGoalsExplanation(analysis: any, expectedGoals: number) {
    const homeStats = analysis.analysis.teamStats.home;
    const awayStats = analysis.analysis.teamStats.away;
    
    const explanations = [];
    
    if (expectedGoals > 2.5) {
      explanations.push(`Both teams average ${((homeStats.goalsPerGame + awayStats.goalsPerGame) / 2).toFixed(1)} goals per game`);
      explanations.push(`Recent matches suggest an attacking encounter with ${expectedGoals.toFixed(1)} expected goals`);
    } else {
      explanations.push(`Defensive strengths of both teams point to a low-scoring affair`);
      explanations.push(`Expected goals total of ${expectedGoals.toFixed(1)} suggests under 2.5 goals`);
    }
    
    return explanations.join('. ') + '.';
  }

  private static generateBttsExplanation(analysis: any, likelihood: number) {
    const homeStats = analysis.analysis.teamStats.home;
    const awayStats = analysis.analysis.teamStats.away;
    
    const explanations = [];
    
    if (likelihood > 50) {
      explanations.push(`Both teams have strong attacking records`);
      explanations.push(`${analysis.homeTeam} averaging ${homeStats.goalsPerGame.toFixed(1)} goals per game`);
      explanations.push(`${analysis.awayTeam} finding the net in most recent matches`);
    } else {
      explanations.push(`Defensive solidity from both sides makes clean sheets likely`);
      explanations.push(`Recent form suggests at least one team may fail to score`);
    }
    
    return explanations.join(' and ') + '.';
  }

  // Estimate odds based on confidence
  private static estimateOdds(betType: string, confidence: number) {
    // Convert confidence to implied probability, then to decimal odds
    const impliedProbability = confidence / 100;
    let baseOdds = 1 / impliedProbability;
    
    // Add bookmaker margin (typically 5-10%)
    baseOdds = baseOdds * 1.07;
    
    // Round to typical betting odds
    return Math.round(baseOdds * 20) / 20; // Round to nearest 0.05
  }

  // Risk assessment for predictions
  static assessRisk(prediction: any, analysis: any): string[] {
    const risks = [];
    
    // Low confidence risks
    if (prediction.confidence < 70) {
      risks.push('Moderate confidence level suggests higher risk');
    }
    
    // Weather risks
    if (analysis.analysis.weather.impact === 'negative') {
      risks.push('Adverse weather conditions may impact match flow');
    }
    
    // Form inconsistency
    const homeForm = analysis.analysis.teamStats.home.form;
    const awayForm = analysis.analysis.teamStats.away.form;
    
    if (this.isFormInconsistent(homeForm) || this.isFormInconsistent(awayForm)) {
      risks.push('Inconsistent recent form increases unpredictability');
    }
    
    // Head-to-head unpredictability
    const h2h = analysis.analysis.headToHead;
    if (h2h.totalMeetings > 5) {
      const resultSpread = Math.max(h2h.homeWinPercentage, h2h.awayWinPercentage, h2h.drawPercentage);
      if (resultSpread < 50) {
        risks.push('Historical head-to-head record shows high unpredictability');
      }
    }
    
    return risks;
  }

  private static isFormInconsistent(form: string[]): boolean {
    if (form.length < 3) return false;
    
    const results = form.slice(0, 5);
    const wins = results.filter(r => r === 'W').length;
    const losses = results.filter(r => r === 'L').length;
    
    return Math.abs(wins - losses) <= 1; // Very mixed results
  }
}