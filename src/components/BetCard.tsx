'use client';

import { useState } from 'react';
import { BetTip } from '@/types';
import { Lock, TrendingUp, Calendar, Zap, Target, BarChart3 } from 'lucide-react';

interface BetCardProps {
  bet: BetTip;
  isLocked?: boolean;
  onUnlock?: () => void;
}

export default function BetCard({ bet, isLocked = false, onUnlock }: BetCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getBetTypeDisplay = (type: string) => {
    const types = {
      'over_2_5_goals': 'Over 2.5 Goals',
      'under_2_5_goals': 'Under 2.5 Goals',
      'match_result': 'Match Result',
      'btts': 'Both Teams to Score',
      'home_win': 'Home Win',
      'away_win': 'Away Win',
      'draw': 'Draw'
    };
    return types[type as keyof typeof types] || type;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-accent-green';
    if (confidence >= 60) return 'text-accent-cyan';
    return 'text-accent-pink';
  };

  const getConfidenceGlow = (confidence: number) => {
    if (confidence >= 80) return 'shadow-glow-green';
    if (confidence >= 60) return 'shadow-glow-cyan';
    return 'shadow-glow-pink';
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

  if (isLocked) {
    return (
      <div className="relative bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 glass-effect-strong group hover:scale-105 transition-all duration-500 border border-accent-purple/20 hover:border-accent-purple/40">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 via-accent-pink/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Lock className="w-16 h-16 text-accent-purple animate-glow-pulse" />
              <div className="absolute inset-0 w-16 h-16 border-2 border-accent-purple/30 rounded-full animate-ping" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-accent-purple mb-3 tracking-tight">Premium Pick</h3>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">Unlock to see expert analysis and AI predictions</p>
            <button
              onClick={onUnlock}
              className="w-full btn-premium py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-premium"
            >
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Upgrade to Premium
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCardClick = () => {
    if (bet.isPremium && !isLocked) {
      // Navigate to detailed analysis page
      window.location.href = `/bet/${bet.id}`;
    }
  };

  return (
    <div
      className={`relative bg-gradient-to-br ${getConfidenceBg(bet.confidence)} rounded-2xl p-8 glass-effect-strong transition-all duration-500 cursor-pointer border ${getConfidenceBorder(bet.confidence)} hover:scale-105 hover:shadow-premium group ${
        isHovered ? getConfidenceGlow(bet.confidence) : ''
      } ${bet.isPremium && !isLocked ? 'hover:border-accent-purple/60' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
        isHovered ? 'opacity-20' : 'opacity-0'
      } bg-gradient-to-br ${getConfidenceBg(bet.confidence)}`} />
      
      <div className="relative z-10">
        {/* Header with league and confidence */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" />
              <span className="text-sm font-medium text-accent-cyan uppercase tracking-wider">{bet.match.league}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 leading-tight tracking-tight">
              {bet.match.homeTeam} <span className="text-gray-400">vs</span> {bet.match.awayTeam}
            </h3>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">{bet.match.date}</span>
            </div>
          </div>
          
          {/* Confidence circle visualization */}
          <div className="relative flex flex-col items-center">
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
                  stroke={bet.confidence >= 80 ? '#10b981' : bet.confidence >= 60 ? '#06b6d4' : '#ec4899'}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - bet.confidence / 100)}`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-2xl font-bold ${getConfidenceColor(bet.confidence)}`}>
                  {bet.confidence}%
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1 font-medium">Confidence</div>
          </div>
        </div>

        {/* Bet type and odds */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-pink" />
              <span className="text-accent-pink font-bold text-lg">{getBetTypeDisplay(bet.type)}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-green" />
              <span className="text-accent-green text-2xl font-bold">{bet.odds}</span>
            </div>
          </div>
          
          {/* Visual odds indicator */}
          <div className="bg-dark-300/50 rounded-full p-1">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                bet.confidence >= 80 ? 'bg-gradient-to-r from-accent-green to-accent-cyan' :
                bet.confidence >= 60 ? 'bg-gradient-to-r from-accent-cyan to-accent-blue' : 
                'bg-gradient-to-r from-accent-pink to-accent-purple'
              }`}
              style={{ width: `${bet.confidence}%` }}
            />
          </div>
        </div>

        {/* AI explanation */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-accent-purple" />
            <span className="text-accent-purple text-sm font-semibold uppercase tracking-wider">AI Insight</span>
          </div>
          <p className="text-gray-300 leading-relaxed">{bet.explanation}</p>
          <p className="text-xs text-gray-500 mt-3 italic">
            *Educational analysis only. Not professional betting advice.
          </p>
        </div>

        {/* Action button */}
        <div className="space-y-3">
          {bet.isPremium && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-purple/10 rounded-full text-accent-purple text-sm font-medium border border-accent-purple/20">
                <Zap className="w-4 h-4" />
                Click for detailed analysis
              </div>
            </div>
          )}
          <button className="w-full btn-premium py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-premium group-hover:shadow-glow-green">
            <span className="flex items-center justify-center gap-3">
              <TrendingUp className="w-6 h-6" />
              View at Bookmaker
              <span className="text-sm opacity-75">({bet.odds})</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}