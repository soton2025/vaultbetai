'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Target, BarChart3, Lock, Star, Zap, Crown } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Tooltip from '@/components/Tooltip';
import SignUpModal from './SignUpModal';
import { BetTip } from '@/types';

export default function FreePick() {
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [bets, setBets] = useState<BetTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/bets?limit=6');
        const data = await response.json();
        
        if (data.success && data.data) {
          const transformedBets: BetTip[] = data.data.map((bet: any, index: number) => ({
            id: bet.id,
            type: bet.bet_type,
            odds: bet.recommended_odds,
            confidence: bet.confidence_score,
            explanation: bet.explanation,
            match: {
              homeTeam: bet.home_team,
              awayTeam: bet.away_team,
              league: bet.league,
              date: bet.match_date
            },
            affiliateLink: 'https://bet365.com/affiliate-link',
            isPremium: index > 0 // First bet is free, rest are premium
          }));
          
          setBets(transformedBets);
        } else {
          setError('Failed to load picks');
        }
      } catch (error) {
        console.error('Error fetching bets:', error);
        setError('Unable to connect to service');
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  const getBetTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'home_win': 'Home Win',
      'away_win': 'Away Win',
      'draw': 'Draw',
      'over_2_5_goals': 'Over 2.5 Goals',
      'under_2_5_goals': 'Under 2.5 Goals',
      'over_1_5_goals': 'Over 1.5 Goals',
      'under_1_5_goals': 'Under 1.5 Goals',
      'btts': 'Both Teams to Score',
      'btts_yes': 'Both Teams to Score',
      'btts_no': 'Both Teams Not to Score',
    };
    
    return types[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-accent-green';
    if (confidence >= 60) return 'text-accent-cyan';
    return 'text-accent-pink';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'from-accent-green/20 to-accent-green/5';
    if (confidence >= 60) return 'from-accent-cyan/20 to-accent-cyan/5';
    return 'from-accent-pink/20 to-accent-pink/5';
  };

  const getConfidenceBorder = (confidence: number) => {
    if (confidence >= 80) return 'border-accent-green/30';
    if (confidence >= 60) return 'border-accent-cyan/30';
    return 'border-accent-pink/30';
  };

  const freeBet = bets.find(bet => !bet.isPremium);
  const premiumBets = bets.filter(bet => bet.isPremium).slice(0, 5);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <LoadingSpinner size="lg" color="purple" />
          <div className="text-white text-xl font-medium mt-6">Loading Today's Research...</div>
          <div className="text-gray-400 text-sm mt-2">Analyzing market data and statistical patterns</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-red-400 font-medium mb-2">Unable to load picks</div>
            <div className="text-red-300 text-sm mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Today's <span className="text-gradient-premium">Research</span> Insights
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Advanced quantitative analysis with transparent confidence scores. Educational research only.
        </p>
      </div>

      {/* Free Pick Section */}
      {freeBet && (
        <div className="mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-accent-green/10 rounded-full border border-accent-green/20">
              <Star className="w-5 h-5 text-accent-green animate-pulse" />
              <span className="text-accent-green text-lg font-bold">FREE Sample Research</span>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className={`relative bg-gradient-to-br ${getConfidenceBg(freeBet.confidence)} rounded-2xl p-8 glass-effect-strong transition-all duration-500 border ${getConfidenceBorder(freeBet.confidence)} hover:scale-105 hover:shadow-premium animate-slide-up`}>
              <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-accent-cyan uppercase tracking-wider">{freeBet.match.league}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight tracking-tight">
                      {freeBet.match.homeTeam} <span className="text-gray-400">vs</span> {freeBet.match.awayTeam}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">{freeBet.match.date}</span>
                    </div>
                  </div>
                  
                  {/* Confidence Circle */}
                  <div className="relative flex flex-col items-center">
                    <Tooltip 
                      content="AI confidence based on statistical models and historical data" 
                      position="top"
                    >
                      <div className="relative w-20 h-20">
                        <svg className="transform -rotate-90 w-20 h-20">
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke={freeBet.confidence >= 80 ? '#10b981' : freeBet.confidence >= 60 ? '#06b6d4' : '#ec4899'}
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 36}`}
                            strokeDashoffset={`${2 * Math.PI * 36 * (1 - freeBet.confidence / 100)}`}
                            className="transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`text-2xl font-bold ${getConfidenceColor(freeBet.confidence)}`}>
                            {freeBet.confidence}%
                          </div>
                        </div>
                      </div>
                    </Tooltip>
                    <div className="text-xs text-gray-400 mt-1 font-medium">AI Confidence</div>
                  </div>
                </div>

                {/* Bet Details */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-accent-pink" />
                      <span className="text-accent-pink font-bold text-lg">{getBetTypeDisplay(freeBet.type)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-accent-green" />
                      <span className="text-accent-green text-2xl font-bold">{freeBet.odds}</span>
                    </div>
                  </div>
                  
                  {/* Confidence Bar */}
                  <div className="bg-dark-300/50 rounded-full p-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        freeBet.confidence >= 80 ? 'bg-gradient-to-r from-accent-green to-accent-cyan' :
                        freeBet.confidence >= 60 ? 'bg-gradient-to-r from-accent-cyan to-accent-blue' : 
                        'bg-gradient-to-r from-accent-pink to-accent-purple'
                      }`}
                      style={{ width: `${freeBet.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Analysis */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-accent-purple" />
                    <span className="text-accent-purple text-sm font-semibold uppercase tracking-wider">AI Analysis</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{freeBet.explanation}</p>
                  <p className="text-xs text-gray-500 mt-3 italic">
                    *Educational research only. Not professional investment advice.
                  </p>
                </div>

                {/* Action Button */}
                <button className="w-full btn-premium py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-premium hover:shadow-glow-green">
                  <span className="flex items-center justify-center gap-3">
                    <TrendingUp className="w-6 h-6" />
                    View Market Analysis
                    <span className="text-sm opacity-75">({freeBet.odds})</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Picks Section */}
      {premiumBets.length > 0 && (
        <div>
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-accent-purple/10 rounded-full border border-accent-purple/20">
              <Crown className="w-5 h-5 text-accent-purple animate-glow-pulse" />
              <span className="text-accent-purple text-lg font-bold">PREMIUM Research Models</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {premiumBets.map((bet, index) => (
              <div 
                key={bet.id}
                className="relative bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong group cursor-pointer transition-all duration-500 border border-accent-purple/20 hover:border-accent-purple/40 hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setShowSignUpModal(true)}
              >
                {/* Blur Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 via-accent-pink/5 to-transparent rounded-2xl backdrop-blur-sm opacity-90" />
                
                {/* Lock Icon */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="relative">
                    <Lock className="w-8 h-8 text-accent-purple animate-glow-pulse" />
                    <div className="absolute inset-0 w-8 h-8 border-2 border-accent-purple/30 rounded-full animate-ping" />
                  </div>
                </div>

                {/* Blurred Content */}
                <div className="relative z-10 filter blur-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-accent-cyan rounded-full" />
                        <span className="text-xs font-medium text-accent-cyan uppercase tracking-wider">PREMIER LEAGUE</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1 leading-tight">
                        Team A <span className="text-gray-400">vs</span> Team B
                      </h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Today 15:00</span>
                      </div>
                    </div>
                    
                    <div className="relative w-16 h-16">
                      <svg className="transform -rotate-90 w-16 h-16">
                        <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                        <circle cx="32" cy="32" r="28" stroke="#10b981" strokeWidth="4" fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * 0.15}`}
                                strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-lg font-bold text-accent-green">85%</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent-pink" />
                        <span className="text-accent-pink font-bold">Over 2.5 Goals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-accent-green" />
                        <span className="text-accent-green text-xl font-bold">1.85</span>
                      </div>
                    </div>
                    
                    <div className="bg-dark-300/50 rounded-full p-1">
                      <div className="h-2 rounded-full bg-gradient-to-r from-accent-green to-accent-cyan" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Advanced statistical modeling indicates strong value opportunity based on team attacking patterns...
                    </p>
                  </div>
                </div>

                {/* Unlock Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center">
                    <div className="mb-4">
                      <Zap className="w-12 h-12 text-accent-purple mx-auto animate-pulse" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">Create Free Account</h4>
                    <p className="text-gray-300 text-sm">Unlock 5+ More Daily Research Models</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <button
              onClick={() => setShowSignUpModal(true)}
              className="btn-premium px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-premium hover:shadow-glow-purple flex items-center gap-3 mx-auto"
            >
              <Zap className="w-6 h-6" />
              Create Free Account - Unlock All Research
            </button>
            <p className="text-gray-400 text-sm mt-4">
              No credit card required • Instant access • Educational research only
            </p>
          </div>
        </div>
      )}

      <SignUpModal 
        isOpen={showSignUpModal} 
        onClose={() => setShowSignUpModal(false)} 
      />
    </div>
  );
}