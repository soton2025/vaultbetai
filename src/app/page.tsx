'use client';

import { useState } from 'react';
import { Zap, Filter, Crown, TrendingUp, Star, User } from 'lucide-react';
import Link from 'next/link';
import BetCard from '@/components/BetCard';
import SubscriptionModal from '@/components/SubscriptionModal';
import FilterPanel, { FilterState } from '@/components/FilterPanel';
import BookmakerSection from '@/components/BookmakerSection';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Footer from '@/components/Footer';
import { useUser } from '@/context/UserContext';
import { mockBets } from '@/data/mockBets';
import { stripePromise } from '@/lib/stripe';

export default function Home() {
  const { user, isLoading } = useUser();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [, setFilters] = useState<FilterState>({
    riskLevel: [],
    betTypes: [],
    minConfidence: 0,
    minOdds: 1.0,
    maxOdds: 10.0,
  });

  const freeBet = mockBets[0];
  const premiumBets = mockBets.slice(1);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent-purple/20 border-t-accent-purple mx-auto mb-6"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-16 w-16 border-2 border-accent-pink/30 mx-auto"></div>
          </div>
          <div className="text-white text-xl font-medium">Loading AI Betting Tips...</div>
          <div className="text-gray-400 text-sm mt-2">Analyzing market data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <header className="border-b border-gray-800/50 glass-effect-strong sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple via-accent-pink to-accent-green rounded-xl flex items-center justify-center shadow-premium animate-glow-pulse">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">AI Betting Tips</h1>
                <p className="text-accent-cyan text-sm font-medium">Expert predictions powered by AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilterPanel(true)}
                className="flex items-center gap-2 px-5 py-3 bg-dark-100 text-white rounded-xl hover:bg-dark-50 transition-all duration-300 glass-effect border border-gray-700/50 hover:border-accent-purple/30 hover:shadow-glow-purple"
              >
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters</span>
              </button>
              
              <Link
                href="/account"
                className="flex items-center gap-2 px-5 py-3 bg-dark-100 text-white rounded-xl hover:bg-dark-50 transition-all duration-300 glass-effect border border-gray-700/50 hover:border-accent-cyan/30 hover:shadow-glow-cyan"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Account</span>
              </Link>
              
              {!user?.hasActiveSubscription && (
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="btn-premium flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-glow-purple"
                >
                  <Crown className="w-5 h-5" />
                  Go Premium
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              Today&apos;s <span className="text-premium">AI-Generated</span> Insights
            </h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed font-light">
              AI-powered sports analysis and predictions for educational purposes. Not professional betting advice.
            </p>
          </div>

          <DisclaimerBanner />

          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                <Star className="w-8 h-8 text-accent-green animate-float" />
                Free Daily Analysis
              </h3>
              {user?.freeBetUsedToday && (
                <span className="text-accent-cyan text-sm bg-dark-100 px-4 py-2 rounded-full glass-effect border border-accent-cyan/20">
                  Used today - come back tomorrow!
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 max-w-3xl mx-auto">
              <div className="animate-slide-up">
                <BetCard 
                  bet={freeBet} 
                  isLocked={user?.freeBetUsedToday}
                  onUnlock={() => setShowSubscriptionModal(true)}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                <Crown className="w-8 h-8 text-accent-purple animate-glow-pulse" />
                Premium AI Insights
              </h3>
              <div className="text-accent-purple text-sm font-medium bg-accent-purple/10 px-4 py-2 rounded-full border border-accent-purple/20">
                {user?.hasActiveSubscription ? '5 insights available' : 'Unlock with premium'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {premiumBets.map((bet, index) => (
                <div 
                  key={bet.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BetCard
                    bet={bet}
                    isLocked={!user?.hasActiveSubscription}
                    onUnlock={() => setShowSubscriptionModal(true)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <BookmakerSection userLocation={user?.location} />

        <div className="text-center premium-border p-12 glass-effect-strong">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-6 tracking-tight">Ready to Win More?</h3>
            <p className="text-gray-300 text-lg mb-10 leading-relaxed">
              Join thousands of smart bettors who trust our AI-powered predictions for consistent profits
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-3 p-6 glass-effect rounded-xl border border-accent-green/20">
                <TrendingUp className="w-8 h-8 text-accent-green" />
                <span className="text-2xl font-bold text-accent-green">87%</span>
                <span className="text-gray-300 font-medium">Win Rate</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-6 glass-effect rounded-xl border border-accent-cyan/20">
                <Star className="w-8 h-8 text-accent-cyan" />
                <span className="text-2xl font-bold text-accent-cyan">AI</span>
                <span className="text-gray-300 font-medium">Powered Analysis</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-6 glass-effect rounded-xl border border-accent-pink/20">
                <Crown className="w-8 h-8 text-accent-pink" />
                <span className="text-2xl font-bold text-accent-pink">5+</span>
                <span className="text-gray-300 font-medium">Expert Picks Daily</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
      />

      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        onFiltersChange={setFilters}
        isPremium={user?.hasActiveSubscription || false}
      />

      <Footer />
    </div>
  );
}
