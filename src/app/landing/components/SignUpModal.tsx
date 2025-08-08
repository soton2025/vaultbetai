'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mail, User, Lock, Zap, Star, CheckCircle, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isOver18: false,
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.isOver18) {
      setError('You must confirm you are 18 years or older');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call for now - replace with actual user creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store user data in localStorage for demo
      const newUser = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        hasActiveSubscription: false,
        freeBetUsedToday: false,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('vault-bets-user', JSON.stringify(newUser));
      
      // Send welcome email
      try {
        await fetch('/api/email-automation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'welcome',
            user: {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              signupDate: newUser.createdAt,
              hasActiveSubscription: newUser.hasActiveSubscription
            }
          })
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail signup if email fails
      }
      
      setIsSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        onClose();
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Sign up error:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = (provider: 'google' | 'apple') => {
    // Placeholder for social authentication
    console.log(`Sign up with ${provider}`);
    setError('Social sign-up coming soon! Please use email registration.');
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fade-in">
        <div className="premium-border max-w-md w-full glass-effect-strong relative overflow-hidden animate-scale-in">
          <div className="relative z-10 p-8 text-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-green via-accent-cyan to-accent-blue rounded-2xl mb-6 shadow-glow-green animate-glow-pulse">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Welcome to Vault Bets!</h2>
            <p className="text-gray-300 text-lg mb-6">
              Your account has been created successfully. Redirecting to your research dashboard...
            </p>
            <LoadingSpinner size="sm" color="green" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="premium-border max-w-lg w-full glass-effect-strong relative overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="relative z-10 p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 focus-premium"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-purple via-accent-pink to-accent-cyan rounded-2xl mb-6 shadow-premium animate-glow-pulse">
              <Star className="w-10 h-10 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 rounded-2xl animate-pulse" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Unlock Your <span className="text-gradient-premium">Free</span> Account
            </h2>
            <p className="text-gray-300 text-lg">
              Access 5+ daily AI research models and advanced analytics
            </p>
          </div>

          {/* Social Sign Up Options */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialSignUp('google')}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors font-medium border"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => handleSocialSignUp('apple')}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors font-medium border border-gray-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-400 text-sm">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-dark-100 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-dark-100 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 focus:outline-none transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-dark-100 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 focus:outline-none transition-colors"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isOver18"
                  checked={formData.isOver18}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 bg-dark-100 border border-gray-700 rounded focus:ring-accent-purple focus:ring-2 focus:ring-offset-0 text-accent-purple"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  I confirm I am 18 years or older
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 bg-dark-100 border border-gray-700 rounded focus:ring-accent-purple focus:ring-2 focus:ring-offset-0 text-accent-purple"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  I agree to the{' '}
                  <a href="/terms" className="text-accent-purple hover:text-accent-pink underline">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-accent-purple hover:text-accent-pink underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="text-red-400 text-sm font-medium">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-premium py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-premium hover:shadow-glow-purple"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <LoadingSpinner size="sm" color="white" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Zap className="w-5 h-5" />
                  Unlock My Free Account
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button className="text-accent-purple hover:text-accent-pink underline font-medium">
                Sign in
              </button>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-6">
            <span>🔒</span>
            <span>Secure registration • No spam • Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}