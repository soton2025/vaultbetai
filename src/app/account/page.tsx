'use client';

import { useState } from 'react';
import { User, CreditCard, Settings, LogOut, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

export default function AccountPage() {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call your backend to cancel the Stripe subscription
      console.log('Cancelling subscription...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user state
      if (user) {
        setUser({ ...user, hasActiveSubscription: false });
      }
      
      setShowCancelConfirm(false);
      alert('Subscription cancelled successfully. You&apos;ll continue to have access until the end of your billing period.');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    if (confirm('This will clear all your local data. Are you sure?')) {
      localStorage.removeItem('betting-user');
      window.location.reload();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent-purple/20 border-t-accent-purple mx-auto mb-6"></div>
          <div className="text-white text-xl font-medium">Loading account...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-accent-cyan hover:text-accent-green transition-colors inline-flex items-center gap-2 mb-6">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Account Settings</h1>
          <p className="text-gray-400 text-lg">Manage your subscription and account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-effect-strong premium-border p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-pink rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Account Information</h2>
                  <p className="text-gray-400">User ID: {user.id.slice(0, 8)}...</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white font-semibold mb-2 block">Email Address</label>
                  <input
                    type="email"
                    value={user.email || 'Not provided'}
                    disabled
                    className="w-full bg-dark-100 text-gray-400 rounded-xl px-4 py-3 border border-gray-700/50"
                  />
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">Location</label>
                  <input
                    type="text"
                    value={user.location || 'Auto-detected'}
                    disabled
                    className="w-full bg-dark-100 text-gray-400 rounded-xl px-4 py-3 border border-gray-700/50"
                  />
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="glass-effect-strong premium-border p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  user.hasActiveSubscription 
                    ? 'bg-gradient-to-br from-accent-green to-accent-cyan' 
                    : 'bg-gradient-to-br from-gray-600 to-gray-700'
                }`}>
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Subscription Status</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {user.hasActiveSubscription ? (
                      <CheckCircle className="w-5 h-5 text-accent-green" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={user.hasActiveSubscription ? 'text-accent-green' : 'text-gray-400'}>
                      {user.hasActiveSubscription ? 'Premium Active' : 'Free Plan'}
                    </span>
                  </div>
                </div>
              </div>

              {user.hasActiveSubscription ? (
                <div className="space-y-4">
                  <div className="bg-dark-100 rounded-xl p-4 border border-accent-green/20">
                    <p className="text-white font-semibold mb-2">Premium Benefits Active</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 5 AI insights daily</li>
                      <li>• Advanced filtering options</li>
                      <li>• Priority analysis</li>
                      <li>• No ads</li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full bg-dark-100 hover:bg-red-900/20 text-red-400 hover:text-red-300 py-3 px-6 rounded-xl transition-all duration-300 border border-red-400/20 hover:border-red-400/40"
                  >
                    Cancel Subscription
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-dark-100 rounded-xl p-4 border border-gray-700/50">
                    <p className="text-white font-semibold mb-2">Free Plan Limits</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 1 AI insight daily</li>
                      <li>• Basic features only</li>
                      <li>• Limited analysis</li>
                    </ul>
                  </div>
                  
                  <Link
                    href="/"
                    className="w-full btn-premium py-3 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-premium text-center block"
                  >
                    Upgrade to Premium
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="glass-effect-strong premium-border p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Link
                  href="/contact"
                  className="w-full flex items-center gap-3 p-3 bg-dark-100 hover:bg-dark-50 rounded-xl transition-colors text-white"
                >
                  <Mail className="w-5 h-5 text-accent-cyan" />
                  Contact Support
                </Link>
                
                <Link
                  href="/terms"
                  className="w-full flex items-center gap-3 p-3 bg-dark-100 hover:bg-dark-50 rounded-xl transition-colors text-white"
                >
                  <Settings className="w-5 h-5 text-accent-purple" />
                  Terms of Service
                </Link>
                
                <Link
                  href="/privacy"
                  className="w-full flex items-center gap-3 p-3 bg-dark-100 hover:bg-dark-50 rounded-xl transition-colors text-white"
                >
                  <Settings className="w-5 h-5 text-accent-green" />
                  Privacy Policy
                </Link>
                
                <button
                  onClick={handleClearData}
                  className="w-full flex items-center gap-3 p-3 bg-dark-100 hover:bg-red-900/20 rounded-xl transition-colors text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-5 h-5" />
                  Clear Local Data
                </button>
              </div>
            </div>

            <div className="glass-effect-strong border border-accent-orange/20 p-6">
              <h3 className="text-lg font-bold text-accent-orange mb-3">Need Help?</h3>
              <p className="text-gray-300 text-sm mb-4">
                Have questions or need assistance with your account?
              </p>
              <Link
                href="/contact"
                className="w-full bg-accent-orange hover:bg-accent-orange/80 text-white py-2 px-4 rounded-lg transition-colors text-center block font-semibold"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
            <div className="premium-border max-w-lg w-full glass-effect-strong p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Cancel Subscription?</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Are you sure you want to cancel your premium subscription? You&apos;ll lose access to:
              </p>
              <ul className="text-gray-300 mb-6 space-y-2">
                <li>• 5 daily AI insights</li>
                <li>• Advanced filtering options</li>
                <li>• Priority analysis features</li>
              </ul>
              <p className="text-sm text-gray-400 mb-6">
                You&apos;ll continue to have access until the end of your current billing period.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 bg-dark-100 hover:bg-dark-50 text-white py-3 px-6 rounded-xl transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}