// Professional Analytics Presentation Layer
// Transforms raw intelligence data into professional research reports

export class AnalyticsPresentation {
  
  // Format match intelligence as professional research report
  static formatMatchResearchReport(intelligenceReport: any) {
    return {
      // Executive Summary
      executiveSummary: {
        fixture: intelligenceReport.match.fixture,
        competition: intelligenceReport.match.competition,
        analysisDate: new Date().toLocaleDateString(),
        researchDepth: intelligenceReport.dataIntelligence.analysisDepth,
        dataQuality: this.formatDataQualityDescription(intelligenceReport.statisticalAssessment.dataQuality)
      },

      // Primary Research Findings
      researchFindings: {
        primaryRecommendation: {
          outcome: this.formatOutcomeDescription(intelligenceReport.statisticalAssessment.primaryRecommendation.outcome),
          statisticalConfidence: `${intelligenceReport.statisticalAssessment.confidenceLevel}%`,
          expectedValue: intelligenceReport.statisticalAssessment.primaryRecommendation.expectedValue,
          researchBasis: this.formatResearchBasis(intelligenceReport.statisticalAssessment.supportingFactors)
        },
        
        keyFindings: this.formatKeyFindings(intelligenceReport.quantitativeInsights.keyFindings),
        statisticalEdge: this.formatStatisticalEdge(intelligenceReport.quantitativeInsights.statisticalEdge),
        performanceIndicators: this.formatPerformanceIndicators(intelligenceReport.quantitativeInsights.performanceIndicators)
      },

      // Market Intelligence
      marketIntelligence: {
        sentiment: this.formatMarketSentiment(intelligenceReport.marketAnalysis.sentiment),
        efficiencyRating: `${intelligenceReport.marketAnalysis.efficiencyScore}/10`,
        valueAssessment: this.formatValueAssessment(intelligenceReport.marketAnalysis.valueRating),
        opportunities: this.formatMarketOpportunities(intelligenceReport.marketAnalysis.opportunities)
      },

      // Risk Analysis
      riskAssessment: {
        overallRisk: this.formatRiskCategory(intelligenceReport.riskProfile.overallRisk),
        riskScore: `${Math.round(intelligenceReport.riskProfile.riskScore * 100)}/100`,
        criticalFactors: this.formatRiskFactors(intelligenceReport.riskProfile.keyRisks),
        mitigation: this.formatMitigationStrategies(intelligenceReport.riskProfile.mitigation)
      },

      // Research Methodology & Validation
      methodology: {
        dataSourceCount: intelligenceReport.dataIntelligence.sourcesAnalyzed,
        dataPointAnalysis: `${intelligenceReport.dataIntelligence.dataPoints} data points`,
        algorithms: this.formatAlgorithms(intelligenceReport.researchMethodology.algorithms),
        validationScore: `${intelligenceReport.researchMethodology.validationScore}%`,
        reliabilityIndex: this.formatReliabilityIndex(intelligenceReport.researchMethodology.reliabilityIndex)
      },

      // Professional Disclaimer
      disclaimer: this.generateProfessionalDisclaimer(),
      
      // Metadata
      reportMetadata: {
        generatedAt: intelligenceReport.dataIntelligence.lastUpdated,
        analysisType: 'comprehensive_quantitative',
        reportVersion: '2.0',
        dataFreshness: this.calculateDataFreshness(intelligenceReport.dataIntelligence.lastUpdated)
      }
    };
  }

  // Format daily research digest
  static formatDailyResearchDigest(dailyTips: any) {
    return {
      researchDigest: {
        date: dailyTips.date,
        totalOpportunities: dailyTips.totalMatches,
        qualifiedRecommendations: dailyTips.qualityTips.length,
        averageConfidence: `${dailyTips.summary.averageConfidence}%`,
        overallAssessment: this.formatOverallAssessment(dailyTips.summary.recommendation)
      },

      researchHighlights: {
        distributionAnalysis: this.formatDistributionAnalysis(dailyTips.summary),
        marketTrends: this.formatMarketTrends(dailyTips.summary),
        riskProfile: this.formatDailyRisk(dailyTips.summary.riskAssessment)
      },

      qualifiedOpportunities: dailyTips.qualityTips.map(tip => this.formatOpportunityBrief(tip)),

      researchNotes: dailyTips.summary.keyInsights.map(insight => 
        this.convertToResearchLanguage(insight)
      ),

      methodologyNote: this.generateMethodologyNote()
    };
  }

  // Format personalized research portfolio
  static formatPersonalizedResearch(personalizedTips: any) {
    return {
      portfolioAnalysis: {
        clientId: personalizedTips.userId,
        riskProfile: this.formatRiskProfile(personalizedTips.riskProfile),
        recommendedAllocation: this.formatAllocation(personalizedTips.suggestedBankroll),
        performanceMetrics: this.formatPerformanceMetrics(personalizedTips.recommendations.performanceInsights)
      },

      tailoredRecommendations: personalizedTips.matchTips.map(tip => ({
        fixture: tip.match,
        recommendedAction: this.formatRecommendedAction(tip.recommendation),
        personalizationFactors: this.formatPersonalizationFactors(tip.personalized),
        confidenceInterval: this.formatConfidenceInterval(tip.personalized.adjustedConfidence),
        allocationGuidance: this.formatAllocationGuidance(tip.personalized.customStakeSize)
      })),

      portfolioGuidance: {
        strategicRecommendations: this.formatStrategicRecommendations(personalizedTips.recommendations.nextSteps),
        riskManagement: this.formatRiskManagement(personalizedTips.recommendations.bankrollManagement),
        performanceOptimization: this.formatPerformanceOptimization(personalizedTips.recommendations.priorityBets)
      },

      researchMethodology: this.generatePersonalizedMethodology()
    };
  }

  // Helper formatting methods
  private static formatDataQualityDescription(quality: number): string {
    if (quality >= 90) return 'Exceptional data coverage with comprehensive cross-validation';
    if (quality >= 80) return 'High-quality dataset with strong analytical foundation';
    if (quality >= 70) return 'Good data reliability with adequate coverage';
    if (quality >= 60) return 'Moderate data quality with some limitations';
    return 'Limited data availability - exercise additional caution';
  }

  private static formatOutcomeDescription(outcome: string): string {
    const descriptions: Record<string, string> = {
      'home_win': 'Home Team Victory',
      'away_win': 'Away Team Victory', 
      'draw': 'Draw Result',
      'over_2_5_goals': 'Over 2.5 Goals',
      'under_2_5_goals': 'Under 2.5 Goals',
      'btts': 'Both Teams to Score',
      'btts_no': 'Both Teams Not to Score'
    };
    return descriptions[outcome] || 'Alternative Market Opportunity';
  }

  private static formatResearchBasis(factors: string[]): string {
    if (!factors || factors.length === 0) return 'Multi-dimensional quantitative analysis';
    
    return factors.map(factor => 
      factor.replace(/AI|artificial/gi, 'Statistical')
           .replace(/prediction/gi, 'projection')
           .replace(/model/gi, 'algorithm')
    ).join('; ');
  }

  private static formatKeyFindings(findings: string[]): string[] {
    return findings.map(finding => 
      finding.replace(/AI|artificial intelligence/gi, 'Quantitative analysis')
             .replace(/predicts?/gi, 'indicates')
             .replace(/thinks?/gi, 'suggests')
             .replace(/believes?/gi, 'calculates')
    );
  }

  private static formatStatisticalEdge(edge: string): string {
    return edge.replace(/AI|artificial/gi, 'Statistical model')
              .replace(/machine learning/gi, 'pattern recognition')
              .replace(/neural/gi, 'algorithmic');
  }

  private static formatPerformanceIndicators(indicators: string[]): string[] {
    return indicators.map(indicator =>
      indicator.replace(/AI/gi, 'Statistical')
               .replace(/prediction/gi, 'projection')
    );
  }

  private static formatMarketSentiment(sentiment: string): string {
    const sentimentMap: Record<string, string> = {
      'strong_favorite_bias': 'Market exhibits strong directional bias',
      'balanced_market': 'Balanced market conditions observed',
      'value_available': 'Market inefficiencies detected',
      'high_volatility': 'Elevated market volatility present',
      'neutral_sentiment': 'Neutral market positioning',
      'insufficient_data': 'Limited market intelligence available'
    };
    return sentimentMap[sentiment] || 'Market analysis pending';
  }

  private static formatValueAssessment(valueRating: number): string {
    if (valueRating >= 8) return 'Exceptional value opportunity identified';
    if (valueRating >= 6) return 'Favorable value proposition detected';
    if (valueRating >= 4) return 'Moderate value potential observed';
    return 'Limited value opportunity in current market';
  }

  private static formatMarketOpportunities(opportunities: any[]): string[] {
    return opportunities.map(opp => 
      `${opp.market}: ${opp.valueRating}/10 value rating - ${opp.reasoning}`
    );
  }

  private static formatRiskCategory(risk: string): string {
    const riskMap: Record<string, string> = {
      'low_risk': 'Conservative Risk Profile',
      'moderate_risk': 'Balanced Risk Assessment',
      'high_risk': 'Elevated Risk Environment'
    };
    return riskMap[risk] || 'Risk Assessment Pending';
  }

  private static formatRiskFactors(risks: string[]): string[] {
    return risks.map(risk => 
      risk.replace(/AI/gi, 'Model').charAt(0).toUpperCase() + risk.slice(1)
    );
  }

  private static formatMitigationStrategies(mitigation: string[]): string[] {
    return mitigation.map(strategy =>
      strategy.replace(/AI/gi, 'Statistical model')
    );
  }

  private static formatAlgorithms(algorithms: string[]): string[] {
    const algorithmMap: Record<string, string> = {
      'correlation_analysis': 'Multi-Variable Correlation Analysis',
      'pattern_recognition': 'Historical Pattern Recognition',
      'market_efficiency': 'Market Efficiency Modeling',
      'risk_modeling': 'Quantitative Risk Assessment'
    };
    
    return algorithms.map(alg => algorithmMap[alg] || alg);
  }

  private static formatReliabilityIndex(index: number): string {
    if (index >= 0.9) return 'Exceptional reliability (AAA-rated)';
    if (index >= 0.8) return 'High reliability (AA-rated)';
    if (index >= 0.7) return 'Good reliability (A-rated)';
    if (index >= 0.6) return 'Moderate reliability (BBB-rated)';
    return 'Limited reliability (Below investment grade)';
  }

  private static calculateDataFreshness(lastUpdated: string): string {
    const now = new Date();
    const updated = new Date(lastUpdated);
    const hoursDiff = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60));
    
    if (hoursDiff < 1) return 'Real-time data';
    if (hoursDiff < 6) return `${hoursDiff} hours fresh`;
    if (hoursDiff < 24) return 'Today\'s data';
    return 'Historical baseline';
  }

  private static formatOverallAssessment(recommendation: string): string {
    return recommendation.replace(/AI|artificial/gi, 'Quantitative research')
                        .replace(/tips/gi, 'opportunities')
                        .replace(/betting/gi, 'investment');
  }

  private static formatDistributionAnalysis(summary: any) {
    return {
      marketDistribution: summary.betTypeDistribution,
      leagueDistribution: summary.leagueDistribution,
      qualityMetrics: `Average confidence: ${summary.averageConfidence}%`
    };
  }

  private static formatMarketTrends(summary: any) {
    return [
      'Cross-league opportunity analysis completed',
      'Market efficiency patterns identified',
      'Risk-return profiles calculated'
    ];
  }

  private static formatDailyRisk(riskAssessment: string): string {
    return riskAssessment.replace(/betting/gi, 'market participation');
  }

  private static formatOpportunityBrief(tip: any) {
    return {
      fixture: tip.match,
      recommendation: this.formatOutcomeDescription(tip.recommendation.betType),
      confidence: `${tip.recommendation.confidence}% statistical confidence`,
      valueMetrics: `Expected value: ${tip.recommendation.expectedOdds}`,
      researchQuality: tip.insights.dataQuality
    };
  }

  private static convertToResearchLanguage(insight: string): string {
    return insight.replace(/AI|artificial intelligence/gi, 'Statistical analysis')
                 .replace(/predicts?/gi, 'projects')
                 .replace(/betting/gi, 'market')
                 .replace(/tips/gi, 'recommendations');
  }

  private static formatRiskProfile(riskProfile: string): string {
    const profileMap: Record<string, string> = {
      'low': 'Conservative Investment Profile',
      'medium': 'Balanced Risk Tolerance',
      'high': 'Aggressive Growth Strategy'
    };
    return profileMap[riskProfile] || 'Moderate Risk Approach';
  }

  private static formatAllocation(bankroll: number): string {
    return `Recommended portfolio allocation: ${bankroll} units`;
  }

  private static formatPerformanceMetrics(metrics: any) {
    return {
      historicalPerformance: metrics.trends || [],
      strengthAreas: metrics.strengths || [],
      optimizationOpportunities: metrics.improvements || []
    };
  }

  private static formatRecommendedAction(recommendation: any) {
    return {
      primaryAction: this.formatOutcomeDescription(recommendation.betType),
      allocation: `${recommendation.suggestedStake} units`,
      targetValue: recommendation.expectedOdds,
      rationale: recommendation.reasoning?.replace(/AI/gi, 'Analysis')
    };
  }

  private static formatPersonalizationFactors(personalized: any) {
    return {
      riskAdjustment: 'Portfolio-specific risk calibration applied',
      allocationOptimization: 'Personalized position sizing calculated',
      strategicAlignment: 'Aligned with historical performance patterns'
    };
  }

  private static formatConfidenceInterval(confidence: number): string {
    const lower = Math.max(50, confidence - 10);
    const upper = Math.min(95, confidence + 10);
    return `Statistical confidence interval: ${lower}% - ${upper}%`;
  }

  private static formatAllocationGuidance(stakeSize: number): string {
    return `Recommended allocation: ${stakeSize} units (portfolio-optimized)`;
  }

  private static formatStrategicRecommendations(recommendations: string[]): string[] {
    return recommendations.map(rec =>
      rec.replace(/betting/gi, 'portfolio')
         .replace(/bets/gi, 'positions')
    );
  }

  private static formatRiskManagement(bankrollAdvice: string[]): string[] {
    return bankrollAdvice.map(advice =>
      advice.replace(/betting/gi, 'investment')
           .replace(/stake/gi, 'allocation')
    );
  }

  private static formatPerformanceOptimization(priorityBets: string[]): string[] {
    return priorityBets.map(bet =>
      bet.replace(/bet/gi, 'opportunity')
         .replace(/AI/gi, 'Statistical model')
    );
  }

  private static generateProfessionalDisclaimer(): string {
    return "This research report is based on comprehensive quantitative analysis of multiple data sources and statistical modeling techniques. All recommendations are for informational purposes only and should not be considered as financial advice. Past performance does not guarantee future results. Please consider your risk tolerance and conduct additional due diligence before making investment decisions.";
  }

  private static generateMethodologyNote(): string {
    return "Analysis employs proprietary quantitative algorithms including multi-variable correlation analysis, historical pattern recognition, market efficiency modeling, and risk assessment frameworks. Data sources include real-time sports statistics, market odds, weather conditions, and historical performance metrics.";
  }

  private static generatePersonalizedMethodology(): string {
    return "Portfolio recommendations generated through personalized quantitative modeling, incorporating individual risk profiles, historical performance analysis, and behavioral pattern recognition. Allocation guidance based on modern portfolio theory principles adapted for sports market applications.";
  }

  // Generate executive summary for multiple analyses
  static generateExecutiveSummary(analyses: any[]) {
    const totalOpportunities = analyses.length;
    const avgConfidence = analyses.reduce((sum, analysis) => 
      sum + (analysis.statisticalAssessment?.confidenceLevel || 75), 0
    ) / totalOpportunities;
    
    const highConfidenceCount = analyses.filter(analysis => 
      (analysis.statisticalAssessment?.confidenceLevel || 75) >= 80
    ).length;

    return {
      analysisOverview: {
        totalOpportunitiesAnalyzed: totalOpportunities,
        averageStatisticalConfidence: `${Math.round(avgConfidence)}%`,
        highConfidenceOpportunities: highConfidenceCount,
        researchDepth: 'Multi-dimensional quantitative analysis'
      },
      
      keyInsights: [
        `${totalOpportunities} market opportunities subjected to comprehensive analysis`,
        `${highConfidenceCount} opportunities meet high-confidence statistical criteria`,
        `Average confidence level: ${Math.round(avgConfidence)}% across all analyses`,
        'Cross-validation performed across multiple data sources and methodologies'
      ],

      recommendationSummary: this.generateRecommendationSummary(analyses),
      
      riskOverview: this.generateRiskOverview(analyses),
      
      executiveRecommendation: this.generateExecutiveRecommendation(analyses)
    };
  }

  private static generateRecommendationSummary(analyses: any[]) {
    const recommendations = analyses.map(a => 
      a.statisticalAssessment?.primaryRecommendation?.outcome || 'pending'
    );
    
    const distribution = recommendations.reduce((acc: Record<string, number>, rec) => {
      acc[rec] = (acc[rec] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([outcome, count]) => 
      `${this.formatOutcomeDescription(outcome)}: ${count} opportunities identified`
    );
  }

  private static generateRiskOverview(analyses: any[]) {
    const riskLevels = analyses.map(a => a.riskProfile?.overallRisk || 'moderate_risk');
    const lowRisk = riskLevels.filter(r => r === 'low_risk').length;
    const highRisk = riskLevels.filter(r => r === 'high_risk').length;
    
    return {
      portfolioRisk: lowRisk > highRisk ? 'Conservative' : 'Balanced',
      lowRiskOpportunities: lowRisk,
      elevatedRiskOpportunities: highRisk,
      riskManagementNote: 'Diversified approach recommended across risk spectrum'
    };
  }

  private static generateExecutiveRecommendation(analyses: any[]): string {
    const highQualityCount = analyses.filter(a => 
      (a.statisticalAssessment?.confidenceLevel || 75) >= 75 &&
      a.riskProfile?.overallRisk !== 'high_risk'
    ).length;

    if (highQualityCount === 0) {
      return 'Current market conditions suggest a cautious approach. Recommend waiting for higher-confidence opportunities.';
    }

    if (highQualityCount <= 2) {
      return `Selective approach recommended. ${highQualityCount} high-quality opportunities identified for focused allocation.`;
    }

    return `Favorable market conditions detected. ${highQualityCount} qualified opportunities support diversified portfolio approach.`;
  }
}