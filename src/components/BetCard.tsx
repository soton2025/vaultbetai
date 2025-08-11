'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';
import { BetTip } from '@/types';
import { Lock, TrendingUp, Calendar, Zap, Target, BarChart3 } from 'lucide-react';

interface BetCardProps {
  bet: BetTip;
  isLocked?: boolean;
  onUnlock?: () => void;
}

export default function BetCard({ bet, isLocked = false, onUnlock }: BetCardProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const getBetTypeDisplay = (type: string) => {
    const types = {
      // Match Result
      'home_win': 'Home Win',
      'away_win': 'Away Win',
      'draw': 'Draw',
      'match_result': 'Match Result',
      
      // Goals Markets
      'over_2_5_goals': 'Over 2.5 Goals',
      'under_2_5_goals': 'Under 2.5 Goals',
      'over_1_5_goals': 'Over 1.5 Goals',
      'under_1_5_goals': 'Under 1.5 Goals',
      'over_3_5_goals': 'Over 3.5 Goals',
      'under_3_5_goals': 'Under 3.5 Goals',
      'over_0_5_goals': 'Over 0.5 Goals',
      'under_0_5_goals': 'Under 0.5 Goals',
      
      // Both Teams to Score
      'btts': 'Both Teams to Score',
      'btts_yes': 'Both Teams to Score',
      'btts_no': 'Both Teams Not to Score',
      
      // Double Chance
      'home_or_draw': 'Home Win or Draw',
      'away_or_draw': 'Away Win or Draw',
      'home_or_away': 'Home Win or Away Win',
      
      // Clean Sheet
      'home_clean_sheet': 'Home Team Clean Sheet',
      'away_clean_sheet': 'Away Team Clean Sheet'
    };
    
    // Handle dynamic handicap formatting
    if (type.includes('handicap')) {
      return formatHandicapDisplay(type);
    }
    
    // Handle dynamic over/under goals that aren't in the static list
    if (type.includes('over_') || type.includes('under_')) {
      return formatGoalsDisplay(type);
    }
    
    // Return mapped type or format generically
    return types[type as keyof typeof types] || formatGenericDisplay(type);
  };

  const formatHandicapDisplay = (type: string) => {
    // Extract team name and handicap value  
    const parts = type.split('_');
    if (parts.length < 3) return type.replace(/_/g, ' ');
    
    const teamIndex = parts.findIndex(p => p === 'handicap');
    if (teamIndex === -1) return type.replace(/_/g, ' ');
    
    const teamPart = parts.slice(0, teamIndex).join(' ');
    const handicapParts = parts.slice(teamIndex + 1);
    
    // Format team name
    const teamName = teamPart.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    // Format handicap value
    let handicapValue = '';
    if (handicapParts.includes('minus')) {
      const valueIndex = handicapParts.indexOf('minus') + 1;
      const value = handicapParts[valueIndex] || '0';
      handicapValue = `-${value.replace('_', '.')}`;
    } else if (handicapParts.includes('plus')) {
      const valueIndex = handicapParts.indexOf('plus') + 1;
      const value = handicapParts[valueIndex] || '0';
      handicapValue = `+${value.replace('_', '.')}`;
    }
    
    return `${teamName} ${handicapValue} Handicap`;
  };

  const formatGoalsDisplay = (type: string) => {
    if (type.startsWith('over_')) {
      const goalValue = type.replace('over_', '').replace('_', '.');
      return `Over ${goalValue} Goals`;
    } else if (type.startsWith('under_')) {
      const goalValue = type.replace('under_', '').replace('_', '.');
      return `Under ${goalValue} Goals`;
    }
    return type.replace(/_/g, ' ');
  };

  const formatGenericDisplay = (type: string) => {
    // Convert underscores to spaces and capitalize each word
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-accent-green';
    if (confidence >= 60) return 'text-accent-cyan';
    return 'text-accent-purple';
  };

  if (isLocked) {
    return (
      <div className="relative bg-dark-100 rounded-2xl p-8 border border-accent-purple/20 transition-all duration-300 hover:border-accent-purple/40">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-16 h-16 text-accent-purple" />
          </div>
          <h3 className="text-2xl font-bold text-accent-purple mb-3">Premium Analysis</h3>
          <p className="text-gray-300 mb-4 text-lg">Unlock detailed research and predictions</p>
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-accent-cyan">
            <div className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-pulse"></div>
            <span>7-day free trial</span>
          </div>
          <button
            onClick={onUnlock}
            className="w-full btn-premium py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Access Research Platform
            </span>
          </button>
        </div>
      </div>
    );
  }

  const handleCardClick = () => {
    if (bet.isPremium && !isLocked && !isNavigating) {
      setIsNavigating(true);
      // Navigate to detailed analysis page
      router.push(`/bet/${bet.id}`);
    }
  };

  return (
    <div
      className="relative bg-dark-100 rounded-2xl p-8 border border-gray-700/30 transition-all duration-300 cursor-pointer hover:border-accent-purple/40 hover:scale-102"
      onClick={handleCardClick}
    >
      <div>
        {/* Header with league and confidence */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-accent-cyan uppercase tracking-wider">{bet.match.league}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {bet.match.homeTeam} <span className="text-gray-400">vs</span> {bet.match.awayTeam}
            </h3>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">{bet.match.date}</span>
            </div>
          </div>
          
          {/* Confidence display */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${getConfidenceColor(bet.confidence)} mb-1`}>
              {isNavigating ? (
                <LoadingSpinner size="sm" color="purple" />
              ) : (
                `${bet.confidence}%`
              )}
            </div>
            <div className="text-xs text-gray-400 font-medium">Confidence</div>
          </div>
        </div>

        {/* Bet type and odds */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-purple" />
              <span className="text-white font-bold text-lg">{getBetTypeDisplay(bet.type)}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-green" />
              <span className="text-accent-green text-2xl font-bold">{bet.odds}</span>
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-accent-purple" />
            <span className="text-accent-purple text-sm font-semibold uppercase tracking-wider">Analysis</span>
          </div>
          <p className="text-gray-300 leading-relaxed">{bet.explanation}</p>
          <p className="text-xs text-gray-500 mt-3">
            *Educational research only. Not investment advice.
          </p>
        </div>

        {/* Action button */}
        <div className="space-y-3">
          {bet.isPremium && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-purple/10 rounded-full text-accent-purple text-sm font-medium border border-accent-purple/20">
                <Zap className="w-4 h-4" />
                Click for detailed research
              </div>
            </div>
          )}
          <button className="w-full bg-dark-200 border border-gray-600/50 py-3 px-6 rounded-xl text-white font-medium transition-all duration-300 hover:bg-dark-100 hover:border-gray-500/50">
            <span className="flex items-center justify-center gap-3">
              <TrendingUp className="w-5 h-5" />
              View Market Data
              <span className="text-sm opacity-75">({bet.odds})</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}