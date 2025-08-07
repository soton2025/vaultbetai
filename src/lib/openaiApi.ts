import OpenAI from 'openai';
import { DatabaseService } from './database';

// OpenAI API Integration Service
export class OpenAIApiService {
  private static client: OpenAI | null = null;
  
  // Initialize OpenAI client
  private static getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured in environment variables');
      }
      
      this.client = new OpenAI({
        apiKey: apiKey,
      });
    }
    
    return this.client;
  }

  // Generate data analysis insights for historical betting performance
  static async analyzeHistoricalData(data: {
    bets: any[];
    timeframe: string;
    metrics?: any;
  }) {
    try {
      const client = this.getClient();
      
      const prompt = this.buildDataAnalysisPrompt(data);
      
      console.log(`🤖 OpenAI API: Analyzing historical data for ${data.timeframe} timeframe`);
      
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1500,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: "You are a data scientist specializing in sports betting analytics. Analyze historical betting data to identify patterns, trends, and provide actionable insights. Focus on statistical significance and data-driven recommendations."
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      // Log API usage for cost tracking
      await DatabaseService.logApiUsage('openai', 'data-analysis', 0.03); // ~$0.03 per analysis
      
      const analysisText = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        analysis: analysisText,
        insights: this.extractInsights(analysisText),
        recommendations: this.extractRecommendations(analysisText),
        patterns: this.extractPatterns(analysisText)
      };
      
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        analysis: null
      };
    }
  }

  // Generate personalized betting tips based on user preferences and data
  static async generatePersonalizedTips(userData: {
    userId: string;
    preferences: {
      sportTypes: string[];
      riskLevel: 'low' | 'medium' | 'high';
      budgetRange: string;
      favoriteLeagues: string[];
    };
    bettingHistory: any[];
    currentBalance?: number;
  }) {
    try {
      const client = this.getClient();
      
      const prompt = this.buildPersonalizedTipsPrompt(userData);
      
      console.log(`🤖 OpenAI API: Generating personalized tips for user ${userData.userId}`);
      
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1200,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: "You are a personalized betting advisor. Generate tailored betting recommendations based on user preferences, risk tolerance, and historical performance. Always promote responsible gambling and bankroll management."
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      await DatabaseService.logApiUsage('openai', 'personalized-tips', 0.025);
      
      const tipsText = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        tips: tipsText,
        riskAssessment: this.extractRiskAssessment(tipsText),
        bankrollRecommendations: this.extractBankrollAdvice(tipsText),
        priorityTips: this.extractPriorityTips(tipsText)
      };
      
    } catch (error) {
      console.error('OpenAI Personalized Tips Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Analyze market sentiment and betting trends
  static async analyzeMarketSentiment(marketData: {
    sport: string;
    leagues: string[];
    timeframe: string;
    oddsMovements: any[];
    publicBettingData?: any;
  }) {
    try {
      const client = this.getClient();
      
      const prompt = this.buildMarketSentimentPrompt(marketData);
      
      console.log(`🤖 OpenAI API: Analyzing market sentiment for ${marketData.sport}`);
      
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1000,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: "You are a market sentiment analyst specializing in sports betting markets. Analyze betting trends, odds movements, and market psychology to identify opportunities and risks."
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      await DatabaseService.logApiUsage('openai', 'market-sentiment', 0.02);
      
      const sentimentText = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        sentiment: sentimentText,
        marketTrends: this.extractMarketTrends(sentimentText),
        opportunities: this.extractOpportunities(sentimentText),
        warnings: this.extractWarnings(sentimentText)
      };
      
    } catch (error) {
      console.error('OpenAI Market Sentiment Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generate advanced statistical insights
  static async generateAdvancedStatistics(statsData: {
    teams: any[];
    matches: any[];
    analysisType: 'correlation' | 'regression' | 'clustering' | 'prediction';
    parameters: any;
  }) {
    try {
      const client = this.getClient();
      
      const prompt = this.buildAdvancedStatsPrompt(statsData);
      
      console.log(`🤖 OpenAI API: Generating ${statsData.analysisType} analysis`);
      
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1500,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: "You are a sports statistician with expertise in advanced analytics. Perform sophisticated statistical analysis on sports data to uncover hidden patterns and betting opportunities."
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      await DatabaseService.logApiUsage('openai', 'advanced-stats', 0.035);
      
      const statsText = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        analysis: statsText,
        correlations: this.extractCorrelations(statsText),
        predictions: this.extractStatsPredictions(statsText),
        confidence: this.extractStatisticalConfidence(statsText)
      };
      
    } catch (error) {
      console.error('OpenAI Advanced Stats Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Build data analysis prompt
  private static buildDataAnalysisPrompt(data: {
    bets: any[];
    timeframe: string;
    metrics?: any;
  }): string {
    const { bets, timeframe, metrics } = data;
    
    return `
Analyze this historical betting data for comprehensive insights:

**DATA OVERVIEW:**
- Timeframe: ${timeframe}
- Total Bets Analyzed: ${bets.length}
- Win Rate: ${this.calculateWinRate(bets)}%
- Total Stakes: $${this.calculateTotalStakes(bets)}
- Net Profit/Loss: $${this.calculateNetPL(bets)}

**BET BREAKDOWN:**
${this.formatBetBreakdown(bets)}

**PERFORMANCE METRICS:**
${metrics ? JSON.stringify(metrics, null, 2) : 'No additional metrics provided'}

**REQUIRED ANALYSIS:**

1. **Performance Patterns**
   - Best performing bet types and leagues
   - Time-based performance trends (day of week, month, etc.)
   - Streak analysis (winning/losing runs)

2. **Statistical Insights**
   - ROI by bet category
   - Variance and risk metrics
   - Correlation between bet size and success rate

3. **Behavioral Analysis**
   - Betting frequency patterns
   - Stake sizing consistency
   - Risk management effectiveness

4. **Actionable Recommendations**
   - Areas for improvement
   - Optimal betting strategies based on historical performance
   - Risk management suggestions

Provide specific, data-driven insights with numerical support where possible.
    `.trim();
  }

  // Build personalized tips prompt
  private static buildPersonalizedTipsPrompt(userData: {
    userId: string;
    preferences: {
      sportTypes: string[];
      riskLevel: 'low' | 'medium' | 'high';
      budgetRange: string;
      favoriteLeagues: string[];
    };
    bettingHistory: any[];
    currentBalance?: number;
  }): string {
    const { preferences, bettingHistory, currentBalance } = userData;
    
    return `
Generate personalized betting recommendations for this user:

**USER PROFILE:**
- Risk Level: ${preferences.riskLevel}
- Preferred Sports: ${preferences.sportTypes.join(', ')}
- Favorite Leagues: ${preferences.favoriteLeagues.join(', ')}
- Budget Range: ${preferences.budgetRange}
- Current Balance: $${currentBalance || 'Not specified'}

**BETTING HISTORY SUMMARY:**
- Total Historical Bets: ${bettingHistory.length}
- Historical Win Rate: ${this.calculateWinRate(bettingHistory)}%
- Most Successful Bet Types: ${this.getMostSuccessfulBetTypes(bettingHistory)}
- Average Stake: $${this.getAverageStake(bettingHistory)}

**GENERATE PERSONALIZED RECOMMENDATIONS:**

1. **Tailored Tips**
   - 3-5 specific betting opportunities matching user preferences
   - Recommended stake sizes based on risk level and bankroll
   - Expected value and confidence ratings

2. **Bankroll Management**
   - Personalized staking strategy
   - Risk allocation recommendations
   - Stop-loss and profit target suggestions

3. **Strategy Optimization**
   - Bet types that align with historical success
   - League/sport focus recommendations
   - Timing strategies based on user patterns

4. **Responsible Gambling Reminders**
   - Budget adherence advice
   - Risk awareness notes
   - Profit taking recommendations

Focus on actionable, personalized advice that aligns with the user's proven strengths and risk tolerance.
    `.trim();
  }

  // Build market sentiment prompt
  private static buildMarketSentimentPrompt(marketData: {
    sport: string;
    leagues: string[];
    timeframe: string;
    oddsMovements: any[];
    publicBettingData?: any;
  }): string {
    const { sport, leagues, timeframe, oddsMovements, publicBettingData } = marketData;
    
    return `
Analyze current market sentiment and betting trends:

**MARKET DATA:**
- Sport: ${sport}
- Leagues: ${leagues.join(', ')}
- Analysis Timeframe: ${timeframe}
- Odds Movements Tracked: ${oddsMovements.length} markets

**ODDS MOVEMENT SUMMARY:**
${this.formatOddsMovements(oddsMovements)}

**PUBLIC BETTING DATA:**
${publicBettingData ? JSON.stringify(publicBettingData, null, 2) : 'Limited public betting data available'}

**SENTIMENT ANALYSIS REQUIRED:**

1. **Market Direction**
   - Overall market sentiment (bullish/bearish/neutral)
   - Sharp vs public money indicators
   - Line movement significance

2. **Opportunity Identification**
   - Value bets against market sentiment
   - Contrarian opportunities
   - Market inefficiencies

3. **Risk Assessment**
   - Market volatility indicators
   - Potential sentiment reversals
   - Timing considerations

4. **Strategic Recommendations**
   - Optimal market entry points
   - Hedge opportunities
   - Position sizing based on market conditions

Provide actionable insights based on market psychology and sentiment indicators.
    `.trim();
  }

  // Build advanced statistics prompt
  private static buildAdvancedStatsPrompt(statsData: {
    teams: any[];
    matches: any[];
    analysisType: 'correlation' | 'regression' | 'clustering' | 'prediction';
    parameters: any;
  }): string {
    const { teams, matches, analysisType, parameters } = statsData;
    
    return `
Perform advanced statistical analysis on this sports data:

**DATASET:**
- Teams: ${teams.length}
- Matches: ${matches.length}
- Analysis Type: ${analysisType}
- Parameters: ${JSON.stringify(parameters, null, 2)}

**DATA SAMPLE:**
Teams: ${teams.slice(0, 3).map(t => t.name || t.teamName).join(', ')}${teams.length > 3 ? '...' : ''}
Recent Matches: ${matches.slice(0, 5).map(m => `${m.homeTeam} vs ${m.awayTeam}`).join(', ')}${matches.length > 5 ? '...' : ''}

**STATISTICAL ANALYSIS REQUEST:**

1. **${analysisType.toUpperCase()} ANALYSIS**
   - Identify key statistical relationships
   - Quantify correlation strengths and significance
   - Highlight unexpected patterns

2. **Predictive Insights**
   - Statistical indicators for future performance
   - Variable importance rankings
   - Confidence intervals and error margins

3. **Betting Applications**
   - How statistical findings translate to betting opportunities
   - Market inefficiencies revealed by analysis
   - Risk-adjusted return calculations

4. **Model Validation**
   - Statistical significance tests
   - Cross-validation results where applicable
   - Limitations and assumptions

Provide mathematically rigorous analysis with practical betting applications.
    `.trim();
  }

  // Helper methods for data processing
  private static calculateWinRate(bets: any[]): number {
    if (bets.length === 0) return 0;
    const wins = bets.filter(bet => bet.result === 'win' || bet.status === 'won').length;
    return Math.round((wins / bets.length) * 100);
  }

  private static calculateTotalStakes(bets: any[]): number {
    return bets.reduce((total, bet) => total + (bet.stake || bet.amount || 0), 0);
  }

  private static calculateNetPL(bets: any[]): number {
    return bets.reduce((total, bet) => {
      const stake = bet.stake || bet.amount || 0;
      const payout = bet.payout || 0;
      return total + (payout - stake);
    }, 0);
  }

  private static formatBetBreakdown(bets: any[]): string {
    const breakdown = bets.reduce((acc, bet) => {
      const type = bet.betType || bet.type || 'Unknown';
      if (!acc[type]) acc[type] = 0;
      acc[type]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown)
      .map(([type, count]) => `- ${type}: ${count} bets`)
      .join('\n');
  }

  private static getMostSuccessfulBetTypes(bets: any[]): string {
    const successByType = bets.reduce((acc, bet) => {
      const type = bet.betType || bet.type || 'Unknown';
      if (!acc[type]) acc[type] = { wins: 0, total: 0 };
      acc[type].total++;
      if (bet.result === 'win' || bet.status === 'won') {
        acc[type].wins++;
      }
      return acc;
    }, {} as Record<string, { wins: number; total: number }>);

    return Object.entries(successByType)
      .map(([type, stats]) => ({
        type,
        winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 3)
      .map(item => `${item.type} (${item.winRate.toFixed(1)}%)`)
      .join(', ');
  }

  private static getAverageStake(bets: any[]): number {
    if (bets.length === 0) return 0;
    const totalStakes = this.calculateTotalStakes(bets);
    return Math.round((totalStakes / bets.length) * 100) / 100;
  }

  private static formatOddsMovements(movements: any[]): string {
    return movements.slice(0, 5).map(movement => 
      `${movement.match || 'Match'}: ${movement.market || 'Market'} moved from ${movement.openingOdds} to ${movement.currentOdds}`
    ).join('\n');
  }

  // Text extraction methods
  private static extractInsights(text: string): string[] {
    const insightPatterns = [
      /insight[s]?:\s*(.+?)(?=\n|$)/gi,
      /key finding[s]?:\s*(.+?)(?=\n|$)/gi,
      /observation[s]?:\s*(.+?)(?=\n|$)/gi
    ];
    
    const insights: string[] = [];
    insightPatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => insights.push(match[1].trim()));
    });
    
    return insights.length > 0 ? insights : ['Analysis completed - see full report for details'];
  }

  private static extractRecommendations(text: string): string[] {
    const recPattern = /recommend[s|ation]*:\s*(.+?)(?=\n\n|\n[A-Z]|$)/gi;
    const matches = [...text.matchAll(recPattern)];
    return matches.map(match => match[1].trim()).slice(0, 5);
  }

  private static extractPatterns(text: string): string[] {
    const patternSection = text.match(/pattern[s]?:?\s*(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (!patternSection) return [];
    
    return patternSection[1]
      .split(/[-•\n]/)
      .map(pattern => pattern.trim())
      .filter(pattern => pattern.length > 10)
      .slice(0, 4);
  }

  private static extractRiskAssessment(text: string): string {
    const riskMatch = text.match(/risk[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/i);
    return riskMatch ? riskMatch[1].trim() : 'Moderate risk based on current analysis';
  }

  private static extractBankrollAdvice(text: string): string[] {
    const bankrollSection = text.match(/bankroll[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (!bankrollSection) return ['Maintain disciplined staking approach'];
    
    return bankrollSection[1]
      .split(/[-•\n]/)
      .map(advice => advice.trim())
      .filter(advice => advice.length > 5)
      .slice(0, 3);
  }

  private static extractPriorityTips(text: string): string[] {
    const tipPatterns = [
      /priority[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/gi,
      /top tip[s]?[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/gi,
      /best bet[s]?[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/gi
    ];
    
    const tips: string[] = [];
    tipPatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => tips.push(match[1].trim()));
    });
    
    return tips.slice(0, 3);
  }

  private static extractMarketTrends(text: string): string[] {
    const trendSection = text.match(/trend[s]?[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (!trendSection) return [];
    
    return trendSection[1]
      .split(/[-•\n]/)
      .map(trend => trend.trim())
      .filter(trend => trend.length > 10)
      .slice(0, 4);
  }

  private static extractOpportunities(text: string): string[] {
    const oppSection = text.match(/opportunit[y|ies][:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (!oppSection) return [];
    
    return oppSection[1]
      .split(/[-•\n]/)
      .map(opp => opp.trim())
      .filter(opp => opp.length > 10)
      .slice(0, 3);
  }

  private static extractWarnings(text: string): string[] {
    const warningSection = text.match(/warning[s]?[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (!warningSection) return [];
    
    return warningSection[1]
      .split(/[-•\n]/)
      .map(warning => warning.trim())
      .filter(warning => warning.length > 10)
      .slice(0, 3);
  }

  private static extractCorrelations(text: string): string[] {
    const corrSection = text.match(/correlation[s]?[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (!corrSection) return [];
    
    return corrSection[1]
      .split(/[-•\n]/)
      .map(corr => corr.trim())
      .filter(corr => corr.length > 10)
      .slice(0, 4);
  }

  private static extractStatsPredictions(text: string): string[] {
    const predSection = text.match(/prediction[s]?[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (!predSection) return [];
    
    return predSection[1]
      .split(/[-•\n]/)
      .map(pred => pred.trim())
      .filter(pred => pred.length > 10)
      .slice(0, 3);
  }

  private static extractStatisticalConfidence(text: string): number {
    const confMatch = text.match(/confidence[:\s]+(\d+(?:\.\d+)?)%/i);
    if (confMatch) {
      return parseFloat(confMatch[1]);
    }
    
    const sigMatch = text.match(/significant[:\s]+(\d+(?:\.\d+)?)%/i);
    if (sigMatch) {
      return parseFloat(sigMatch[1]);
    }
    
    return 85.0; // Default confidence
  }

  // Test API connection
  static async testConnection(): Promise<boolean> {
    try {
      const client = this.getClient();
      
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Respond with "API connection successful" to confirm the integration is working.'
          }
        ]
      });
      
      const responseText = response.choices[0]?.message?.content || '';
      return responseText.includes('successful');
      
    } catch (error) {
      console.error('OpenAI API connection test failed:', error);
      return false;
    }
  }

  // Get API usage statistics
  static async getApiUsageStats() {
    try {
      const query = `
        SELECT 
          endpoint,
          SUM(requests_made) as total_requests,
          SUM(cost_estimate) as total_cost,
          DATE(date) as date
        FROM api_usage 
        WHERE api_provider = 'openai' 
          AND date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY endpoint, date
        ORDER BY date DESC, total_requests DESC
      `;
      
      return await DatabaseService.query(query);
    } catch (error) {
      console.error('Error fetching OpenAI API stats:', error);
      return [];
    }
  }

  // Available models and pricing
  static readonly MODELS = {
    GPT_4O: 'gpt-4o',
    GPT_4_TURBO: 'gpt-4-turbo-preview',
    GPT_3_5_TURBO: 'gpt-3.5-turbo'
  };

  static readonly PRICING = {
    GPT_4O: { input: 0.005, output: 0.015 }, // per 1K tokens
    GPT_4_TURBO: { input: 0.01, output: 0.03 },
    GPT_3_5_TURBO: { input: 0.001, output: 0.002 }
  };
}