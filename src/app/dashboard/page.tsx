'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Crown, 
  TrendingUp, 
  Star, 
  User, 
  Shield, 
  Zap, 
  BarChart3, 
  Calendar,
  Target,
  Settings,
  LogOut,
  ArrowRight,
  Award,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import BetCard from '@/components/BetCard';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Footer from '@/components/Footer';
import VaultLogo from '@/components/VaultLogo';
import PageTransition from '@/components/PageTransition';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BetTip } from '@/types';
import { useUser } from '@/context/UserContext';

export default function Dashboard() {
  const { user, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [bets, setBets] = useState<BetTip[]>([]);
  const [betsLoading, setBetsLoading] = useState(true);
  const [betsError, setBetsError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push('/');
      return;
    }
  }, [router, user]);

  useEffect(() => {
    const fetchBets = async () => {
      if (!user) return; // Don't fetch if no user
      
      try {
        setBetsLoading(true);
        setBetsError(null);
        
        const response = await fetch('/api/bets?limit=8', {
          headers: {
            'X-User-Data': encodeURIComponent(JSON.stringify(user))
          }
        });
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
            affiliateLink: '',
            isPremium: bet.is_premium
          }));
          
          setBets(transformedBets);
        } else {
          setBetsError('Failed to load research data');
        }
      } catch (error) {
        console.error('Error fetching bets:', error);
        setBetsError('Unable to connect to research service');
      } finally {
        setBetsLoading(false);
      }
    };

    if (user) {
      fetchBets();
    }
  }, [user]);

  const freeBets = bets.filter(bet => !bet.isPremium);
  const premiumBets = bets.filter(bet => bet.isPremium);


  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
        <PageTransition>
          <div className="text-center">
            <LoadingSpinner size="lg" color="purple" />
            <div className="text-white text-xl font-medium mt-6">Loading Dashboard...</div>
          </div>
        </PageTransition>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-gray-800/50 glass-effect-strong sticky top-0 z-40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <VaultLogo size={40} className="animate-glow-pulse animate-subtle-float" />
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Research Dashboard</h1>
                  <p className="text-accent-cyan text-xs font-medium">Advanced Analytics Platform</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Link
                  href="/results"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-accent-cyan hover:text-white transition-colors font-medium"
                >
                  <BarChart3 className="w-4 h-4" />
                  Results Archive
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 px-4 py-2 bg-dark-100 text-white rounded-xl hover:bg-dark-50 transition-all duration-300 glass-effect border border-gray-700/50 hover:border-accent-cyan/30"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-pink rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block font-medium">{user.name || user.email.split('@')[0]}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-dark-100 border border-gray-700/50 rounded-xl shadow-premium glass-effect-strong animate-scale-in">
                      <div className="p-4 border-b border-gray-700/50">
                        <div className="text-white font-medium">{user.name || user.email.split('@')[0]}</div>
                        <div className="text-gray-400 text-sm">{user.email}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`w-2 h-2 rounded-full ${user.hasActiveSubscription ? 'bg-accent-purple' : 'bg-accent-cyan'}`} />
                          <span className={`text-xs font-medium ${user.hasActiveSubscription ? 'text-accent-purple' : 'text-accent-cyan'}`}>
                            {user.hasActiveSubscription ? 'Premium Account' : 'Free Account'}
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/account"
                          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-50 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Account Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-50 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
                  Welcome back, <span className="text-gradient-premium">{(user.name || user.email.split('@')[0]).split(' ')[0]}</span>
                </h2>
                <p className="text-gray-300 text-lg">
                  Your AI-powered research platform is ready. {freeBets.length} free models available today.
                </p>
              </div>
              
            </div>

            {/* Performance Analytics Preview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="glass-effect-strong rounded-xl p-6 border border-accent-green/20 hover:border-accent-green/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-accent-green" />
                  <span className="text-2xl font-bold text-accent-green">87.3%</span>
                </div>
                <div className="text-gray-300 font-medium mb-1">Model Accuracy</div>
                <div className="text-gray-400 text-sm">Last 7 days</div>
              </div>
              
              <div className="glass-effect-strong rounded-xl p-6 border border-accent-cyan/20 hover:border-accent-cyan/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-accent-cyan" />
                  <span className="text-2xl font-bold text-accent-cyan">12.8%</span>
                </div>
                <div className="text-gray-300 font-medium mb-1">ROI Generated</div>
                <div className="text-gray-400 text-sm">Portfolio performance</div>
              </div>
              
              <div className="glass-effect-strong rounded-xl p-6 border border-accent-pink/20 hover:border-accent-pink/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-accent-pink" />
                  <span className="text-2xl font-bold text-accent-pink">73.2%</span>
                </div>
                <div className="text-gray-300 font-medium mb-1">Win Rate</div>
                <div className="text-gray-400 text-sm">Successful predictions</div>
              </div>
              
              <div className="glass-effect-strong rounded-xl p-6 border border-accent-purple/20 hover:border-accent-purple/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <Crown className="w-8 h-8 text-accent-purple animate-glow-pulse" />
                  <span className="text-2xl font-bold text-accent-purple">+15.2%</span>
                </div>
                <div className="text-gray-300 font-medium mb-1">Advanced CLV</div>
                <div className="text-gray-400 text-sm">Closing line value</div>
              </div>
            </div>
          </div>

          {betsLoading && (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" color="purple" />
              <div className="text-white text-xl font-medium mt-6">Loading Research Models...</div>
              <div className="text-gray-400 text-sm mt-2">Analyzing market data and statistical patterns</div>
            </div>
          )}

          {betsError && (
            <div className="text-center mb-12">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md mx-auto">
                <div className="text-red-400 font-medium mb-2">Unable to load research data</div>
                <div className="text-red-300 text-sm mb-4">{betsError}</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!betsLoading && !betsError && bets.length > 0 && (
            <>
              {/* Free Research Section */}
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                    <Star className="w-8 h-8 text-accent-green animate-pulse" />
                    Your Free Research Models
                  </h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent-green/10 rounded-full border border-accent-green/20">
                    <Award className="w-4 h-4 text-accent-green" />
                    <span className="text-accent-green text-sm font-medium">{freeBets.length} models unlocked</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {freeBets.map((bet, index) => (
                    <div 
                      key={bet.id} 
                      className="animate-slide-up card-hover"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <BetCard
                        bet={bet}
                        isLocked={false}
                        onUnlock={() => {}}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Research Section */}
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                    <Crown className="w-8 h-8 text-accent-purple animate-glow-pulse" />
                    Professional Research Models
                  </h3>
                  <div className="text-accent-purple text-sm font-medium bg-accent-purple/10 px-4 py-2 rounded-full border border-accent-purple/20">
                    {user.hasActiveSubscription ? `${premiumBets.length} models available` : `${premiumBets.length} premium models`}
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
                        isLocked={!user.hasActiveSubscription}
                        onUnlock={() => {}}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}



          <DisclaimerBanner />
        </main>


        <Footer />
      </div>
    </PageTransition>
  );
}