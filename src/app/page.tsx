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
          {/* Hero Section */}
          <div className="section-dark py-16 -mx-6 px-6 rounded-3xl mb-16">
            <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              AI-powered sports betting research with{' '}
              <span className="text-gradient-brand">87% model accuracy</span>{' '}
              and proven ROI
            </h1>
            <p className="text-gray-300 text-xl max-w-4xl mx-auto leading-relaxed font-light mb-8">
              Join thousands of members unlocking 5+ daily research models and advanced analytics
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent-green mb-2">87.3%</div>
                <div className="text-gray-300 font-medium">Model Accuracy</div>
                <div className="text-gray-500 text-sm">Last 30 days</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent-green mb-2">+12.8%</div>
                <div className="text-gray-300 font-medium">Average ROI</div>
                <div className="text-gray-500 text-sm">Portfolio performance</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent-green mb-2">73.2%</div>
                <div className="text-gray-300 font-medium">Win Rate</div>
                <div className="text-gray-500 text-sm">Successful predictions</div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 bg-accent-purple rounded-full border-2 border-gray-800"></div>
                <div className="w-6 h-6 bg-accent-cyan rounded-full border-2 border-gray-800"></div>
                <div className="w-6 h-6 bg-accent-green rounded-full border-2 border-gray-800"></div>
              </div>
              <span>+1,200 members joined this month</span>
            </div>
            </div>
          </div>

          {/* Error/Empty State Section */}
          {(betsError || (!betsError && bets.length === 0)) && (
            <div className="py-12 mb-16">
              {betsError && (
                <div className="text-center">
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
                <div className="text-center">
                  <div className="bg-dark-100 border border-gray-700/50 rounded-xl p-8 max-w-md mx-auto glass-effect">
                    <div className="text-gray-300 font-medium mb-2">No betting tips available</div>
                    <div className="text-gray-400 text-sm">Our analysts are working on today's insights. Check back soon!</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Free Sample Section */}
          {!betsError && bets.length > 0 && (
            <div className="section-light py-16 -mx-6 px-6 rounded-3xl mb-16">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    <span className="text-gradient-brand">Free Sample</span> Research Model
                  </h2>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    See our AI analysis in action with today's free pick
                  </p>
                </div>
                
                <div className="max-w-3xl mx-auto">
                  {freeBet ? (
                    <div className="animate-slide-up card-hover mb-8">
                      <BetCard 
                        bet={freeBet} 
                        isLocked={false}
                        onUnlock={() => router.push('/signup')}
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-dark-100 border border-gray-700/50 rounded-xl glass-effect mb-8">
                      <div className="text-gray-300 font-medium mb-2">No free tip available today</div>
                      <div className="text-gray-400 text-sm">Check back tomorrow for your free daily analysis!</div>
                    </div>
                  )}
                  
                  {/* Conversion CTA */}
                  <div className="text-center">
                    <div className="bg-dark-200/50 rounded-2xl p-8 border border-accent-purple/20">
                      <h3 className="text-xl font-bold text-white mb-2">Ready for More?</h3>
                      <p className="text-gray-300 mb-4">
                        Unlock {premiumBets.length} more high-confidence research models today
                      </p>
                      
                      {/* Urgency & Social Proof */}
                      <div className="flex items-center justify-center gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-2 text-accent-green">
                          <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                          <span>47 joined today</span>
                        </div>
                        <div className="text-gray-400">•</div>
                        <div className="text-accent-cyan">7-day free trial</div>
                      </div>
                      
                      <Link
                        href="/signup"
                        className="btn-premium inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
                      >
                        <Crown className="w-5 h-5" />
                        Unlock All Picks — Start Today
                      </Link>
                    </div>
                  </div>
                </div>
              
            {/* Premium Section */}
            <div className="section-dark py-16 -mx-6 px-6 rounded-3xl">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    <span className="text-gradient-brand">Professional</span> Research Models
                  </h2>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
                    Advanced analytics and detailed breakdowns from our institutional-grade models
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-purple/10 rounded-full border border-accent-purple/20">
                    <Crown className="w-4 h-4 text-accent-purple" />
                    <span className="text-accent-purple font-medium text-sm">
                      {premiumBets.length} premium models available today
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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

                {/* Upgrade CTA for premium section */}
                {!user?.hasActiveSubscription && (
                  <div className="text-center">
                    <div className="max-w-4xl mx-auto bg-dark-100/50 rounded-2xl p-12 border border-accent-cyan/20">
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Ready for <span className="text-gradient-brand">Professional</span> Analytics?
                      </h3>
                      <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                        Unlock unlimited research models, advanced analytics, and detailed breakdowns
                      </p>
                      
                      {/* Enhanced Social Proof */}
                      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-8 text-sm">
                        <div className="flex items-center gap-2 text-accent-green">
                          <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                          <span className="font-medium">1,247 members</span>
                        </div>
                        <div className="text-gray-400 hidden md:block">•</div>
                        <div className="text-accent-cyan">
                          <span className="font-medium">87.3% win rate</span>
                        </div>
                        <div className="text-gray-400 hidden md:block">•</div>
                        <div className="text-accent-purple">
                          <span className="font-medium">£2.1M profits</span>
                        </div>
                      </div>
                      
                      <Link
                        href="/signup"
                        className="btn-premium inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-premium"
                      >
                        <Crown className="w-6 h-6" />
                        Get Full Access — £19/month
                      </Link>
                      <p className="text-gray-400 text-sm mt-4">
                        7-day free trial • Cancel anytime • Join 47 who signed up today
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics Section */}
        <div className="section-light py-16 -mx-6 px-6 rounded-3xl mb-16">
          <div className="max-w-7xl mx-auto">
            <PerformanceMetrics />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center mb-16">
          <DisclaimerBanner />
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
