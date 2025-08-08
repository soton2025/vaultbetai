'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, TrendingUp, Shield, BarChart3, Bell, CheckCircle, Zap, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import VaultLogo from '@/components/VaultLogo';
import { stripePromise } from '@/lib/stripe';
import { useUser } from '@/context/UserContext';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // First, create/login the user
      const loginSuccess = await login(email);
      if (!loginSuccess) {
        setError('Failed to create account. Please try again.');
        setIsLoading(false);
        return;
      }

      // Then redirect to Stripe for payment
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const priceId = selectedPlan === 'monthly' ? 'price_1YOUR_MONTHLY_PRICE_ID' : 'price_1YOUR_YEARLY_PRICE_ID';
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId,
          customerEmail: email 
        }),
      });

      const { sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe redirect error:', error);
        setError('Payment setup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
      {/* Header */}
      <header className="border-b border-gray-800/50 glass-effect-strong backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <VaultLogo size={40} className="animate-glow-pulse animate-subtle-float" />
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Vault Bets</h2>
                <p className="text-accent-cyan text-xs font-medium">AI-Powered Sports Analytics</p>
              </div>
            </div>
            
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent-purple via-accent-pink to-accent-green rounded-2xl mb-6 shadow-premium animate-glow-pulse">
            <Crown className="w-12 h-12 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-accent-green/20 rounded-2xl animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Get <span className="text-gradient-premium">Full Access</span>
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Join thousands of users getting professional-grade sports analytics and predictions
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-green/20">
            <CheckCircle className="w-6 h-6 text-accent-green flex-shrink-0" />
            <span className="text-white font-medium">5+ Daily Research Models</span>
          </div>
          <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-cyan/20">
            <TrendingUp className="w-6 h-6 text-accent-cyan flex-shrink-0" />
            <span className="text-white font-medium">Early Access to Picks</span>
          </div>
          <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-pink/20">
            <BarChart3 className="w-6 h-6 text-accent-pink flex-shrink-0" />
            <span className="text-white font-medium">Advanced Analytics</span>
          </div>
          <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-purple/20">
            <Shield className="w-6 h-6 text-accent-purple flex-shrink-0" />
            <span className="text-white font-medium">Risk & CLV Analysis</span>
          </div>
          <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-green/20">
            <Bell className="w-6 h-6 text-accent-green flex-shrink-0" />
            <span className="text-white font-medium">Instant Alerts</span>
          </div>
          <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-cyan/20">
            <Star className="w-6 h-6 text-accent-cyan flex-shrink-0" />
            <span className="text-white font-medium">87% Win Rate</span>
          </div>
        </div>

        {/* Pricing Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="glass-effect rounded-xl p-1 border border-gray-700/50">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedPlan === 'monthly'
                  ? 'bg-accent-purple text-white shadow-glow-purple'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative ${
                selectedPlan === 'yearly'
                  ? 'bg-accent-purple text-white shadow-glow-purple'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Yearly
              <div className="absolute -top-2 -right-2 bg-accent-green text-white text-xs px-2 py-1 rounded-full font-bold">
                Save 57%
              </div>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className={`premium-border p-8 transition-all duration-300 ${
            selectedPlan === 'monthly' ? 'scale-105 shadow-glow-purple' : 'opacity-50'
          }`}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Monthly Plan</h3>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl font-bold text-gradient-premium">£19</span>
              </div>
              <div className="text-gray-400 text-lg mb-4">per month</div>
              <div className="text-accent-cyan font-medium">
                7-day free trial • Cancel anytime
              </div>
            </div>
          </div>

          <div className={`premium-border p-8 transition-all duration-300 ${
            selectedPlan === 'yearly' ? 'scale-105 shadow-glow-purple' : 'opacity-50'
          }`}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Annual Plan</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-bold text-gradient-premium">£99</span>
              </div>
              <div className="text-gray-400 text-sm mb-2">
                <span className="line-through">£228</span> per year
              </div>
              <div className="text-accent-green font-bold mb-4">Save £129 (57%)</div>
              <div className="text-accent-cyan font-medium">
                7-day free trial • Cancel anytime
              </div>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-dark-100 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-premium py-4 px-8 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-premium hover:shadow-glow-purple"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white/20 border-t-white" />
                  <span>Processing...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Zap className="w-6 h-6" />
                  Start {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Trial
                </span>
              )}
            </button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span>🔒</span>
              <span>Secure payment processed by Stripe</span>
            </div>
            <p className="text-gray-500 text-xs max-w-2xl mx-auto">
              By clicking "Start Trial", you agree to our terms and privacy policy. 
              Educational research only - not professional investment advice.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="text-accent-cyan hover:text-accent-pink transition-colors text-sm"
              >
                Already have an account? Sign in →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}