'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUser } from '@/context/UserContext';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const loginSuccess = await login(formData.email, formData.password);
      
      if (loginSuccess) {
        onClose();
        router.push('/dashboard');
      } else {
        setError('Invalid email or password. Try demo@free.com or demo@premium.com');
      }
      
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (email: string) => {
    setFormData({ email, password: 'demo' });
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="premium-border max-w-md w-full glass-effect-strong relative overflow-hidden animate-scale-in">
        <div className="relative z-10 p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 focus-premium"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-300">
              Sign in to access your research dashboard
            </p>
            
            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-dark-100 rounded-lg border border-gray-700/50">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Demo Accounts</div>
              <div className="space-y-2">
                <button
                  onClick={() => fillDemoCredentials('demo@free.com')}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-dark-200 hover:bg-dark-100 transition-colors"
                >
                  <div className="text-accent-cyan text-sm font-medium">demo@free.com</div>
                  <div className="text-gray-400 text-xs">Free account with 2 daily models</div>
                </button>
                <button
                  onClick={() => fillDemoCredentials('demo@premium.com')}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-dark-200 hover:bg-dark-100 transition-colors"
                >
                  <div className="text-accent-purple text-sm font-medium">demo@premium.com</div>
                  <div className="text-gray-400 text-xs">Premium account with full access</div>
                </button>
              </div>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
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
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <button 
                onClick={onClose}
                className="text-accent-purple hover:text-accent-pink underline font-medium"
              >
                Sign up for free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}