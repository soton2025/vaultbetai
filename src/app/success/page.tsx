'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate verification process
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent-purple/20 border-t-accent-purple mx-auto mb-6"></div>
          <div className="text-white text-xl font-medium">Verifying your subscription...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="premium-border p-12 glass-effect-strong animate-scale-in">
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent-green to-accent-cyan rounded-2xl mb-8 shadow-premium">
            <CheckCircle className="w-12 h-12 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-accent-green/20 to-accent-cyan/20 rounded-2xl animate-pulse" />
          </div>

          <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
            Welcome to <span className="text-premium">Premium!</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Your subscription has been activated successfully. You now have access to all premium features!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-green/20">
              <Crown className="w-6 h-6 text-accent-green" />
              <span className="text-white font-medium">5 Expert Picks Daily</span>
            </div>
            <div className="flex items-center gap-4 p-4 glass-effect rounded-xl border border-accent-purple/20">
              <Zap className="w-6 h-6 text-accent-purple" />
              <span className="text-white font-medium">Advanced AI Analysis</span>
            </div>
          </div>

          <div className="space-y-4">
            <Link 
              href="/"
              className="w-full btn-premium py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-premium inline-flex items-center justify-center gap-3"
            >
              <Zap className="w-6 h-6" />
              Start Using Premium Features
            </Link>
            
            {sessionId && (
              <p className="text-sm text-gray-400">
                Session ID: {sessionId.slice(0, 20)}...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent-purple/20 border-t-accent-purple mx-auto mb-6"></div>
          <div className="text-white text-xl font-medium">Loading...</div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}