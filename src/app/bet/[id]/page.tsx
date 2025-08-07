'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Users, 
  MapPin, 
  CloudRain,
  AlertTriangle,
  Crown,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Lock
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { BetTip } from '@/types';
import SubscriptionModal from '@/components/SubscriptionModal';
import ValueChart from '@/components/ValueChart';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import { stripePromise } from '@/lib/stripe';

export default function BetAnalysisPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [bet, setBet] = useState<BetTip | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBet = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/bets/${id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setBet(data.data);
        } else {
          setBet(null);
        }
      } catch (error) {
        console.error('Error fetching bet:', error);
        setBet(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBet();
    }
  }, [id]);

  const handleSubscribe = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_1YOUR_PRICE_ID' }),
      });

      const { sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe redirect error:', error);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent-purple/20 border-t-accent-purple mx-auto mb-6"></div>
          <div className="text-white text-xl font-medium">Loading Analysis...</div>
        </div>
      </div>
    );
  }

  if (!bet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
        <div className="text-center">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-white text-xl font-medium mb-4">Bet Not Found</div>
          <Link href="/" className="btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if user has access to premium content
  const hasAccess = !bet.isPremium || user?.hasActiveSubscription;

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 text-accent-cyan hover:text-accent-blue transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          <div className="text-center bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-12 glass-effect-strong border border-accent-purple/20">
            <div className="relative mb-8">
              <Lock className="w-20 h-20 text-accent-purple mx-auto animate-glow-pulse" />
              <div className="absolute inset-0 w-20 h-20 border-2 border-accent-purple/30 rounded-full animate-ping mx-auto" />
            </div>
            
            <h1 className="text-4xl font-bold text-accent-purple mb-4">Institutional Research</h1>
            <p className="text-gray-300 text-lg mb-8">
              This detailed quantitative analysis is available to research platform subscribers only.
            </p>
            
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">
                {bet.match.homeTeam} vs {bet.match.awayTeam}
              </h3>
              <div className="flex justify-center items-center gap-4 text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>{bet.match.date}</span>
                <span>•</span>
                <span>{bet.match.league}</span>
              </div>
            </div>

            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="btn-premium py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5" />
                Access Research Platform
              </span>
            </button>
          </div>
        </div>

        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={handleSubscribe}
        />
      </div>
    );
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-accent-green" />;
      case 'injured':
      case 'suspended':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'doubtful':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-accent-green" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-accent-cyan hover:text-accent-blue transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 glass-effect-strong border border-gray-700/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-accent-cyan uppercase tracking-wider">{bet.match.league}</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                  {bet.match.homeTeam} <span className="text-gray-400">vs</span> {bet.match.awayTeam}
                </h1>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{bet.match.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span className="text-accent-pink font-semibold">{getBetTypeDisplay(bet.type)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-green mb-1">{bet.odds}</div>
                  <div className="text-sm text-gray-400">Odds</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getConfidenceColor(bet.confidence)} mb-1`}>
                    {bet.confidence}%
                  </div>
                  <div className="text-sm text-gray-400">Confidence</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {bet.analysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Analysis */}
            <div className="lg:col-span-2 space-y-8">
              {/* Expert Analysis */}
              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-accent-purple" />
                  <h2 className="text-xl font-bold text-white">Quantitative Model Output</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">{bet.explanation}</p>
                
                {/* Value Chart */}
                <ValueChart
                  valueRating={bet.analysis.valueAnalysis.valueRating}
                  impliedProbability={bet.analysis.valueAnalysis.impliedProbability}
                  modelProbability={bet.analysis.valueAnalysis.modelProbability}
                />
              </div>

              {/* Head to Head */}
              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-accent-cyan" />
                  <h2 className="text-xl font-bold text-white">Head to Head</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-dark-300/50 rounded-xl">
                    <div className="text-2xl font-bold text-accent-green mb-1">{bet.analysis.headToHead.homeWins}</div>
                    <div className="text-sm text-gray-400">{bet.match.homeTeam} Wins</div>
                  </div>
                  <div className="text-center p-4 bg-dark-300/50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-400 mb-1">{bet.analysis.headToHead.draws}</div>
                    <div className="text-sm text-gray-400">Draws</div>
                  </div>
                  <div className="text-center p-4 bg-dark-300/50 rounded-xl">
                    <div className="text-2xl font-bold text-accent-pink mb-1">{bet.analysis.headToHead.awayWins}</div>
                    <div className="text-sm text-gray-400">{bet.match.awayTeam} Wins</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Last meeting: <span className="text-white">{bet.analysis.headToHead.lastMeeting.score}</span> 
                  on {bet.analysis.headToHead.lastMeeting.date}
                </div>
              </div>

              {/* Team Form */}
              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-accent-green" />
                  <h2 className="text-xl font-bold text-white">Recent Form</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">{bet.match.homeTeam}</h3>
                    <div className="flex gap-2 mb-3">
                      {bet.analysis.teamStats.home.recentForm.map((result, index) => (
                        <div 
                          key={index}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            result === 'W' ? 'bg-accent-green text-white' :
                            result === 'L' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-400">
                      Goals: {bet.analysis.teamStats.home.goalsScored.reduce((a, b) => a + b, 0)} scored, {bet.analysis.teamStats.home.goalsConceded.reduce((a, b) => a + b, 0)} conceded
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-3">{bet.match.awayTeam}</h3>
                    <div className="flex gap-2 mb-3">
                      {bet.analysis.teamStats.away.recentForm.map((result, index) => (
                        <div 
                          key={index}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            result === 'W' ? 'bg-accent-green text-white' :
                            result === 'L' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-400">
                      Goals: {bet.analysis.teamStats.away.goalsScored.reduce((a, b) => a + b, 0)} scored, {bet.analysis.teamStats.away.goalsConceded.reduce((a, b) => a + b, 0)} conceded
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-8">
              {/* Key Players */}
              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4">Key Players</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">{bet.match.homeTeam}</h3>
                    <div className="space-y-2">
                      {bet.analysis.keyPlayers.home.map((player, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{player.name}</span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(player.status)}
                            <span className="text-gray-400">{player.position}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">{bet.match.awayTeam}</h3>
                    <div className="space-y-2">
                      {bet.analysis.keyPlayers.away.map((player, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{player.name}</span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(player.status)}
                            <span className="text-gray-400">{player.position}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Conditions */}
              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4">Match Conditions</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-accent-cyan" />
                    <div>
                      <div className="text-white font-medium">{bet.analysis.venue.name}</div>
                      <div className="text-sm text-gray-400">Capacity: {bet.analysis.venue.capacity.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CloudRain className="w-5 h-5 text-accent-blue" />
                    <div>
                      <div className="text-white font-medium">{bet.analysis.weather.conditions}</div>
                      <div className="text-sm text-gray-400">{bet.analysis.weather.temperature}°C</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-bold text-white">Risk Factors</h2>
                </div>
                <div className="space-y-2">
                  {bet.analysis.riskFactors.map((risk, index) => (
                    <div key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <div className="w-1 h-1 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
                <button className="w-full btn-premium py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
                  <span className="flex items-center justify-center gap-3">
                    <TrendingUp className="w-6 h-6" />
                    View Market Data
                    <span className="text-sm opacity-75">({bet.odds})</span>
                  </span>
                </button>
                <div className="text-xs text-gray-400 text-center mt-3">
                  *Educational research only. Not professional investment advice.
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Fallback for bets without detailed analysis */
          <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 glass-effect-strong border border-gray-700/50">
            <div className="text-center">
              <div className="text-6xl mb-6">🔍</div>
              <h2 className="text-2xl font-bold text-white mb-4">Sample Research</h2>
              <p className="text-gray-300 leading-relaxed mb-8">{bet.explanation}</p>
              <button className="btn-premium py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
                <span className="flex items-center justify-center gap-3">
                  <TrendingUp className="w-6 h-6" />
                  View Market Data
                  <span className="text-sm opacity-75">({bet.odds})</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}