'use client';

import { useState } from 'react';
import { X, Star, Zap, Crown, TrendingUp, Shield, BarChart3, Bell, CheckCircle } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export default function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await onSubscribe();
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="premium-border max-w-4xl w-full glass-effect-strong relative overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">        
        <div className="relative z-10 p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 focus-premium"
          >
            <X className="w-7 h-7" />
          </button>

          <div className="text-center mb-12">
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent-purple via-accent-pink to-accent-green rounded-2xl mb-6 shadow-premium animate-glow-pulse">
              <Crown className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-accent-green/20 rounded-2xl animate-pulse" />
            </div>
            <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Upgrade to <span className="text-gradient-premium">Pro</span>
            </h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Unlock unlimited picks daily, early access to picks, advanced analytics, and Telegram alerts
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-green/20">
              <CheckCircle className="w-6 h-6 text-accent-green flex-shrink-0" />
              <span className="text-white font-medium">Unlimited Daily Picks</span>
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
              <span className="text-white font-medium">Sharpe & CLV Analysis</span>
            </div>
            <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-green/20">
              <Bell className="w-6 h-6 text-accent-green flex-shrink-0" />
              <span className="text-white font-medium">Telegram/Email Alerts</span>
            </div>
            <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-cyan/20">
              <Crown className="w-6 h-6 text-accent-cyan flex-shrink-0" />
              <span className="text-white font-medium">Model Breakdown</span>
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

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full btn-premium py-5 px-8 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-premium hover:shadow-glow-purple mb-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white/20 border-t-white" />
                <span>Processing...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Zap className="w-6 h-6" />
                Start {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Pro Trial
              </span>
            )}
          </button>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span>🔒</span>
              <span>Secure payment processed by Stripe</span>
            </div>
            <p className="text-gray-500 text-xs max-w-2xl mx-auto">
              Subscription automatically renews. Cancel anytime from your account settings. 
              Educational research only - not professional investment advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}