'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Crown, TrendingUp, Star, User, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import BetCard from '@/components/BetCard';
import FilterPanel, { FilterState } from '@/components/FilterPanel';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Footer from '@/components/Footer';
import VaultLogo from '@/components/VaultLogo';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import PageTransition from '@/components/PageTransition';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUser } from '@/context/UserContext';
import { BetTip } from '@/types';

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [, setFilters] = useState<FilterState>({
    riskLevel: [],
    betTypes: [],
    minConfidence: 0,
    minOdds: 1.0,
    maxOdds: 10.0,
  });
  
  const [bets, setBets] = useState<BetTip[]>([]);
  const [betsLoading, setBetsLoading] = useState(true);
  const [betsError, setBetsError] = useState<string | null>(null);

  // No redirect needed - show content to everyone

  // Fetch betting tips from API - always show free content
  useEffect(() => {
    const fetchBets = async () => {
      
      try {
        setBetsLoading(true);
        setBetsError(null);
        
        // Always fetch content - show free bet to everyone, premium to logged in users
        const headers: Record<string, string> = {};
        if (user) {
          headers['X-User-Data'] = encodeURIComponent(JSON.stringify(user));
        }
        
        const response = await fetch('/api/bets?limit=10', { headers });
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform API response to match frontend BetTip interface
          const transformedBets: BetTip[] = data.data.map((bet: any) => ({
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
            affiliateLink: '',
            isPremium: bet.is_premium
          }));
          
          setBets(transformedBets);
        } else {
          setBetsError('Failed to load betting tips');
        }
      } catch (error) {
        console.error('Error fetching bets:', error);
        setBetsError('Unable to connect to betting service');
      } finally {
        setBetsLoading(false);
      }
    };

    fetchBets();
  }, [user]); // Re-fetch when user logs in to show premium content

  const freeBet = bets.find(bet => !bet.isPremium);
  const premiumBets = bets.filter(bet => bet.isPremium);


  // Show loading only while fetching bets
  if (betsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
        <PageTransition>
          <div className="text-center">
            <LoadingSpinner size="lg" color="purple" />
            <div className="text-white text-xl font-medium mt-6">Loading Today's Research...</div>
            <div className="text-gray-400 text-sm mt-2">Analyzing market data and statistical patterns</div>
          </div>
        </PageTransition>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen">
      <header className="border-b border-gray-800/50 glass-effect-strong sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <VaultLogo size={48} className="animate-glow-pulse animate-subtle-float" />
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Vault Bets</h1>
                <p className="text-accent-cyan text-sm font-medium">Quantitative Sports Analytics Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <button
                    onClick={() => setShowFilterPanel(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-dark-100 text-white rounded-xl hover:bg-dark-50 transition-all duration-300 glass-effect border border-gray-700/50 hover:border-accent-purple/30 hover:shadow-glow-purple"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="font-medium">Filters</span>
                  </button>
                  
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-5 py-3 bg-dark-100 text-white rounded-xl hover:bg-dark-50 transition-all duration-300 glass-effect border border-gray-700/50 hover:border-accent-cyan/30 hover:shadow-glow-cyan"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="#premium"
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-accent-cyan hover:text-white transition-colors font-medium"
                  >
                    Track Record
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 bg-dark-100 text-white rounded-xl hover:bg-dark-50 transition-all duration-300 glass-effect border border-gray-700/50 hover:border-accent-cyan/30"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">Sign In</span>
                  </Link>
                </>
              )}
              
              <Link
                href={user?.hasActiveSubscription ? "/dashboard" : "/signup"}
                className="btn-premium flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-glow-purple"
              >
                <Crown className="w-5 h-5" />
                {user?.hasActiveSubscription ? 'Premium Access' : 'Get Full Access'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              Today&apos;s <span className="text-gradient-premium">Algorithmic</span> Analysis
            </h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed font-light">
              Advanced quantitative modeling and statistical analysis for educational research. Not professional investment advice.
            </p>
          </div>

          <DisclaimerBanner />

          {betsError && (
            <div className="text-center mb-12">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md mx-auto">
                <div className="text-red-400 font-medium mb-2">Unable to load betting tips</div>
                <div className="text-red-300 text-sm">{betsError}</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!betsError && bets.length === 0 && (
            <div className="text-center mb-12">
              <div className="bg-dark-100 border border-gray-700/50 rounded-xl p-8 max-w-md mx-auto glass-effect">
                <div className="text-gray-300 font-medium mb-2">No betting tips available</div>
                <div className="text-gray-400 text-sm">Our analysts are working on today's insights. Check back soon!</div>
              </div>
            </div>
          )}

          {!betsError && bets.length > 0 && (
            <>
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                    <Star className="w-8 h-8 text-accent-green animate-float" />
                    Daily Sample Research
                  </h3>
                  {user?.freeBetUsedToday && (
                    <span className="text-accent-cyan text-sm bg-dark-100 px-4 py-2 rounded-full glass-effect border border-accent-cyan/20">
                      Used today - come back tomorrow!
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 max-w-3xl mx-auto">
                  {freeBet ? (
                    <div className="animate-slide-up card-hover">
                      <BetCard 
                        bet={freeBet} 
                        isLocked={false}
                        onUnlock={() => router.push('/signup')}
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-dark-100 border border-gray-700/50 rounded-xl glass-effect">
                      <div className="text-gray-300 font-medium mb-2">No free tip available today</div>
                      <div className="text-gray-400 text-sm">Check back tomorrow for your free daily analysis!</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                  <Crown className="w-8 h-8 text-accent-purple animate-glow-pulse" />
                  Institutional Analytics
                </h3>
                <div className="text-center">
                  <div className="text-accent-purple text-sm font-medium bg-accent-purple/10 px-4 py-2 rounded-full border border-accent-purple/20 mb-2">
                    {user?.hasActiveSubscription ? `${premiumBets.length} models available` : `${premiumBets.length} premium models available`}
                  </div>
                  {!user?.hasActiveSubscription && (
                    <Link
                      href="/signup"
                      className="text-accent-purple hover:text-accent-pink transition-colors font-medium text-sm flex items-center gap-1 mx-auto"
                    >
                      Get full access to unlock all models
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {premiumBets.map((bet, index) => (
                  <div 
                    key={bet.id} 
                    className="animate-slide-up card-hover"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <BetCard
                      bet={bet}
                      isLocked={!user?.hasActiveSubscription}
                      onUnlock={() => router.push('/signup')}
                    />
                  </div>
                ))}
              </div>
            </div>
            </>
          )}
        </div>

        <div className="mb-16">
          <PerformanceMetrics />
        </div>


        <div className="text-center premium-border p-12 glass-effect-strong">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-6 tracking-tight">Ready for Advanced Analytics?</h3>
            <p className="text-gray-300 text-lg mb-10 leading-relaxed">
              Join institutional-grade researchers leveraging quantitative models for market edge analysis
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-3 p-6 glass-effect rounded-xl border border-accent-green/20">
                <TrendingUp className="w-8 h-8 text-accent-green" />
                <span className="text-2xl font-bold text-accent-green">87%</span>
                <span className="text-gray-300 font-medium">Model Accuracy</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-6 glass-effect rounded-xl border border-accent-cyan/20">
                <Shield className="w-8 h-8 text-accent-cyan" />
                <span className="text-2xl font-bold text-accent-cyan">Advanced</span>
                <span className="text-gray-300 font-medium">Statistical Models</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-6 glass-effect rounded-xl border border-accent-pink/20">
                <Crown className="w-8 h-8 text-accent-pink" />
                <span className="text-2xl font-bold text-accent-pink">5+</span>
                <span className="text-gray-300 font-medium">Research Reports Daily</span>
              </div>
            </div>
          </div>
        </div>
      </main>


      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        onFiltersChange={setFilters}
        isPremium={user?.hasActiveSubscription || false}
      />

      <Footer />
      </div>
    </PageTransition>
  );
}
