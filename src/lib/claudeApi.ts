import Anthropic from '@anthropic-ai/sdk';
import { DatabaseService } from './database';

// Claude API Integration Service
export class ClaudeApiService {
  private static client: Anthropic | null = null;
  
  // Initialize Claude client
  private static getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.CLAUDE_API_KEY;
      if (!apiKey) {
        throw new Error('CLAUDE_API_KEY is not configured in environment variables');
      }
      
      this.client = new Anthropic({
        apiKey: apiKey,
      });
    }
    
    return this.client;
  }

  // Generate betting analysis for a match
  static async generateBettingAnalysis(matchData: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    matchDate: string;
    betType: string;
    teamStats?: any;
    headToHead?: any;
    venue?: string;
  }) {
    try {
      const client = this.getClient();
      
      const prompt = this.buildAnalysisPrompt(matchData);
      
      console.log(`🤖 Claude API: Generating analysis for ${matchData.homeTeam} vs ${matchData.awayTeam}`);
      
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.3,
        system: "You are a professional sports analyst specializing in quantitative betting research. Provide detailed, data-driven analysis with confidence scores and risk assessments. Focus on statistical patterns and market inefficiencies.",
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      // Log API usage for cost tracking
      await DatabaseService.logApiUsage('claude', 'analysis', 0.015); // ~$0.015 per analysis
      
      const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
      
      return {
        success: true,
        analysis: analysisText,
        confidence: this.extractConfidenceScore(analysisText),
        riskFactors: this.extractRiskFactors(analysisText),
        valueRating: this.extractValueRating(analysisText)
      };
      
    } catch (error) {
      console.error('Claude API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        analysis: null
      };
    }
  }

  // Build comprehensive analysis prompt
  private static buildAnalysisPrompt(matchData: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    matchDate: string;
    betType: string;
    teamStats?: any;
    headToHead?: any;
    venue?: string;
  }): string {
    const { homeTeam, awayTeam, league, matchDate, betType, teamStats, headToHead, venue } = matchData;
    
    return `
Analyze this upcoming ${league} match for betting research purposes:

**MATCH DETAILS:**
- ${homeTeam} vs ${awayTeam}
- Date: ${matchDate}
- Venue: ${venue || 'TBD'}
- Target Bet Type: ${betType}

**TEAM STATISTICS:**
${teamStats ? `
Home Team (${homeTeam}):
- Recent form and goal statistics
- Home/away record differentials
- Key player availability and impact

Away Team (${awayTeam}):
- Recent form and goal statistics  
- Away performance metrics
- Injury/suspension concerns
` : 'Limited statistical data available - focus on tactical and contextual analysis'}

**HEAD-TO-HEAD ANALYSIS:**
${headToHead ? `
- Total meetings: ${headToHead.totalMeetings || 'Limited history'}
- Recent encounter patterns
- Goal-scoring trends in direct meetings
` : 'Limited head-to-head history - analyze team styles and approaches'}

**REQUIRED ANALYSIS FORMAT:**

1. **Executive Summary** (2-3 sentences)
   - Core betting thesis and market opportunity

2. **Statistical Edge Analysis**
   - Key metrics supporting the ${betType} bet
   - Quantitative confidence score (70-95%)
   - Value rating (1-10 scale)

3. **Risk Assessment**
   - 3-4 specific risk factors that could affect outcome
   - Mitigation strategies and alternative scenarios

4. **Market Analysis**
   - Expected odds range for ${betType}
   - Bookmaker sentiment and line movement predictions

Provide institutional-grade analysis focusing on statistical patterns and market inefficiencies. Be specific about why this ${betType} bet offers value in this particular matchup.
    `.trim();
  }

  // Extract confidence score from Claude response
  private static extractConfidenceScore(analysis: string): number {
    const confidenceMatch = analysis.match(/confidence[:\s]+(\d+)%/i);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1]);
    }
    
    // Fallback: look for percentage patterns
    const percentMatch = analysis.match(/(\d+)%/);
    if (percentMatch) {
      const score = parseInt(percentMatch[1]);
      return score >= 70 && score <= 95 ? score : 82; // Default to 82% if out of range
    }
    
    return 82; // Default confidence score
  }

  // Extract risk factors from Claude response
  private static extractRiskFactors(analysis: string): string[] {
    const riskSection = analysis.match(/risk\s+assessment:?\s*(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (!riskSection) return ['Analysis pending further data validation'];
    
    const risks = riskSection[1]
      .split(/[-•\n]/)
      .map(risk => risk.trim())
      .filter(risk => risk.length > 10 && !risk.match(/^\d+\./))
      .slice(0, 4); // Limit to 4 risk factors
    
    return risks.length > 0 ? risks : ['Market volatility may affect odds movement'];
  }

  // Extract value rating from Claude response
  private static extractValueRating(analysis: string): number {
    const valueMatch = analysis.match(/value[:\s]+(\d+(?:\.\d+)?)/i);
    if (valueMatch) {
      const rating = parseFloat(valueMatch[1]);
      return rating >= 1 && rating <= 10 ? rating : 8.0;
    }
    
    return 8.0; // Default value rating
  }

  // Generate team comparison analysis
  static async generateTeamComparison(team1: string, team2: string, league: string) {
    try {
      const client = this.getClient();
      
      const prompt = `
Compare these two teams for upcoming match analysis:

**TEAMS:** ${team1} vs ${team2}
**LEAGUE:** ${league}

Provide a detailed tactical and statistical comparison covering:

1. **Playing Styles**
   - Formation preferences and tactical approaches
   - Attacking vs defensive focus
   
2. **Key Statistical Metrics**
   - Goals per game trends
   - Defensive solidity metrics
   - Home/away performance differentials

3. **Historical Performance**
   - Recent form analysis (last 5-10 matches)
   - Head-to-head patterns if applicable
   - Big game experience and pressure handling

4. **Current Context**
   - Injury/suspension impacts
   - Manager tactical changes
   - Team motivation factors

Focus on actionable insights for betting research. Highlight the most statistically significant performance gaps between these teams.
      `.trim();

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }]
      });

      await DatabaseService.logApiUsage('claude', 'team-comparison', 0.01);
      
      return {
        success: true,
        comparison: response.content[0].type === 'text' ? response.content[0].text : ''
      };
      
    } catch (error) {
      console.error('Claude Team Comparison Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generate market opportunity analysis
  static async analyzeMarketOpportunity(betType: string, odds: number, matchContext: {
    homeTeam: string;
    awayTeam: string;
    league: string;
  }) {
    try {
      const client = this.getClient();
      
      const prompt = `
Analyze this betting market opportunity:

**BET TYPE:** ${betType}
**CURRENT ODDS:** ${odds}
**MATCH:** ${matchContext.homeTeam} vs ${matchContext.awayTeam}
**LEAGUE:** ${matchContext.league}

Provide institutional-grade market analysis:

1. **Implied Probability Analysis**
   - Convert odds to implied probability
   - Compare against true probability estimate
   - Identify market inefficiency percentage

2. **Value Assessment**
   - Expected value calculation
   - Kelly Criterion stake recommendation
   - Risk-adjusted return potential

3. **Market Movement Prediction**
   - Likely odds movement patterns
   - Public vs sharp money indicators
   - Optimal betting timing strategy

4. **Alternative Market Opportunities**
   - Related bets with better value
   - Hedging opportunities
   - Arbitrage possibilities

Focus on quantitative analysis and specific actionable recommendations.
      `.trim();

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }]
      });

      await DatabaseService.logApiUsage('claude', 'market-analysis', 0.008);
      
      return {
        success: true,
        marketAnalysis: response.content[0].type === 'text' ? response.content[0].text : '',
        impliedProbability: this.calculateImpliedProbability(odds),
        expectedValue: this.calculateExpectedValue(odds, betType)
      };
      
    } catch (error) {
      console.error('Claude Market Analysis Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Calculate implied probability from odds
  private static calculateImpliedProbability(odds: number): number {
    return parseFloat((100 / odds).toFixed(2));
  }

  // Calculate expected value (simplified)
  private static calculateExpectedValue(odds: number, betType: string): number {
    const impliedProb = this.calculateImpliedProbability(odds);
    
    // Rough estimate - would need more sophisticated modeling in production
    const estimatedTrueProb = betType.includes('over') || betType.includes('btts') ? 
      impliedProb + 5 : impliedProb + 3;
    
    return parseFloat(((estimatedTrueProb / 100) * odds - 1).toFixed(3));
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
        WHERE api_provider = 'claude' 
          AND date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY endpoint, date
        ORDER BY date DESC, total_requests DESC
      `;
      
      return await DatabaseService.query(query);
    } catch (error) {
      console.error('Error fetching Claude API stats:', error);
      return [];
    }
  }

  // Test API connection
  static async testConnection(): Promise<boolean> {
    try {
      const client = this.getClient();
      
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Respond with "API connection successful" to confirm the integration is working.'
          }
        ]
      });
      
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      return responseText.includes('successful');
      
    } catch (error) {
      console.error('Claude API connection test failed:', error);
      return false;
    }
  }

  // Available models and pricing
  static readonly MODELS = {
    CLAUDE_3_5_SONNET: 'claude-3-5-sonnet-20241022',
    CLAUDE_3_HAIKU: 'claude-3-haiku-20240307',
    CLAUDE_3_OPUS: 'claude-3-opus-20240229'
  };

  static readonly PRICING = {
    SONNET: { input: 0.003, output: 0.015 }, // per 1K tokens
    HAIKU: { input: 0.00025, output: 0.00125 },
    OPUS: { input: 0.015, output: 0.075 }
  };
}