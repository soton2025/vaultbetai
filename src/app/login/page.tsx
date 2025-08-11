'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import VaultLogo from '@/components/VaultLogo';
import { useUser } from '@/context/UserContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      const loginSuccess = await login(email, password);
      if (loginSuccess) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center gap-4 justify-center">
              <VaultLogo size={48} className="animate-glow-pulse animate-subtle-float" />
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Vault Bets</h2>
                <p className="text-accent-cyan text-xs font-medium">AI-Powered Sports Analytics</p>
              </div>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to access your premium analytics</p>
        </div>

        {/* Login Form */}
        <div className="glass-effect-strong p-8 rounded-2xl border border-gray-700/50">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-100 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave blank for demo accounts (demo@free.com, demo@premium.com)
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-premium py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-premium hover:shadow-glow-purple"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div className="text-sm text-gray-500">
              <span>Demo Accounts:</span>
              <div className="mt-2 space-y-1">
                <div className="text-accent-cyan">admin@admin.com (password: password123)</div>
                <div className="text-accent-green">demo@premium.com (no password)</div>
                <div className="text-gray-400">demo@free.com (no password)</div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-700/50">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="text-accent-purple hover:text-accent-pink transition-colors font-medium"
                >
                  Get full access →
                </Link>
              </p>
            </div>
            
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}