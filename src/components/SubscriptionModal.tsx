'use client';

import { useState } from 'react';
import { X, Star, Zap } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export default function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);

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
      <div className="premium-border max-w-2xl w-full glass-effect-strong relative overflow-hidden animate-scale-in">        
        <div className="relative z-10 p-12">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 focus-premium"
          >
            <X className="w-7 h-7" />
          </button>

          <div className="text-center mb-12">
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent-purple via-accent-pink to-accent-green rounded-2xl mb-6 shadow-premium animate-glow-pulse">
              <Star className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-accent-green/20 rounded-2xl animate-pulse" />
            </div>
            <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">Go <span className="text-premium">Premium</span></h2>
            <p className="text-gray-300 text-xl">Unlock advanced AI analysis and educational insights</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-green/20">
              <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse" />
              <span className="text-white font-medium">5 AI Insights Daily</span>
            </div>
            <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-cyan/20">
              <div className="w-3 h-3 bg-accent-cyan rounded-full animate-pulse" />
              <span className="text-white font-medium">Advanced Risk Filters</span>
            </div>
            <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-pink/20">
              <div className="w-3 h-3 bg-accent-pink rounded-full animate-pulse" />
              <span className="text-white font-medium">Detailed Analytics</span>
            </div>
            <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-purple/20">
              <div className="w-3 h-3 bg-accent-purple rounded-full animate-pulse" />
              <span className="text-white font-medium">Priority Support</span>
            </div>
          </div>

          <div className="premium-border p-8 mb-8">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-2 mb-3">
                <span className="text-5xl font-bold text-premium">$19</span>
                <span className="text-2xl font-bold text-gray-300">.99</span>
              </div>
              <div className="text-gray-400 text-lg mb-2">per month</div>
              <div className="text-accent-cyan font-medium">Cancel anytime • 7-day free trial</div>
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
                Start Premium Trial
              </span>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <span>🔒</span>
            <span>Secure payment processed by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}