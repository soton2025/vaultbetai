'use client';

import { useState } from 'react';
import { TrendingUp, Shield, Crown, Star, Zap, BarChart3, Target, Calendar, ArrowRight, Users, Award, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import VaultLogo from '@/components/VaultLogo';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Footer from '@/components/Footer';
import FreePick from './components/FreePick';
import SignInModal from './components/SignInModal';

export default function LandingPage() {
  const [showSignInModal, setShowSignInModal] = useState(false);
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800/50 glass-effect-strong sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <VaultLogo size={40} className="animate-glow-pulse animate-subtle-float" />
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Vault Bets</h2>
                <p className="text-accent-cyan text-xs font-medium">AI-Powered Sports Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="#free-picks"
                className="hidden md:flex items-center gap-2 px-4 py-2 text-accent-cyan hover:text-white transition-colors font-medium"
              >
                Free Picks
              </Link>
              <Link
                href="#results"
                className="hidden md:flex items-center gap-2 px-4 py-2 text-accent-cyan hover:text-white transition-colors font-medium"
              >
                Track Record
              </Link>
              <button
                onClick={() => setShowSignInModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-dark-100 text-white rounded-xl hover:bg-dark-50 transition-all duration-300 glass-effect border border-gray-700/50 hover:border-accent-cyan/30"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800" />
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
                Beat the Market with <span className="text-gradient-premium">AI-Powered</span> Sports Analysis
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto font-light">
                Vault Bets finds value bets using advanced statistical models. Transparent, proven results. Not betting advice — just winning research.
              </p>
              
              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                <div className="flex flex-col items-center gap-2 p-6 glass-effect rounded-xl border border-accent-green/20 hover:border-accent-green/40 transition-colors">
                  <div className="text-3xl font-bold text-accent-green">87.3%</div>
                  <div className="text-gray-300 font-medium">Accuracy</div>
                </div>
                <div className="flex flex-col items-center gap-2 p-6 glass-effect rounded-xl border border-accent-cyan/20 hover:border-accent-cyan/40 transition-colors">
                  <div className="text-3xl font-bold text-accent-cyan">12.8%</div>
                  <div className="text-gray-300 font-medium">ROI</div>
                </div>
                <div className="flex flex-col items-center gap-2 p-6 glass-effect rounded-xl border border-accent-pink/20 hover:border-accent-pink/40 transition-colors">
                  <div className="text-3xl font-bold text-accent-pink">73.2%</div>
                  <div className="text-gray-300 font-medium">Win Rate</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <a
                  href="#free-picks"
                  className="btn-premium px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-premium hover:shadow-glow-purple flex items-center gap-3 min-w-[200px] justify-center"
                >
                  <Star className="w-6 h-6" />
                  Get Today's Picks
                </a>
                <Link
                  href="#how-it-works"
                  className="flex items-center gap-2 px-8 py-4 bg-dark-100 text-white rounded-xl hover:bg-dark-50 transition-all duration-300 glass-effect border border-gray-700/50 hover:border-accent-cyan/30 font-bold text-lg min-w-[200px] justify-center"
                >
                  <BarChart3 className="w-6 h-6" />
                  How It Works
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Featured In */}
              <div className="text-center mb-8">
                <p className="text-gray-400 text-sm font-medium mb-6 uppercase tracking-wider">Trusted Research Platform</p>
                <div className="flex justify-center items-center gap-8 opacity-60">
                  <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg border border-gray-700/30">
                    <Shield className="w-5 h-5 text-accent-green" />
                    <span className="text-gray-300 font-medium">Verified Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg border border-gray-700/30">
                    <Award className="w-5 h-5 text-accent-cyan" />
                    <span className="text-gray-300 font-medium">Transparent Results</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg border border-gray-700/30">
                    <Users className="w-5 h-5 text-accent-purple" />
                    <span className="text-gray-300 font-medium">Research Grade</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-gradient-to-br from-dark-900 to-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                How Our <span className="text-gradient-premium">AI Models</span> Work
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Advanced quantitative analysis powered by machine learning and statistical modeling
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 glass-effect-strong rounded-2xl border border-accent-purple/20 hover:border-accent-purple/40 transition-all duration-300 card-hover">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-purple to-accent-pink rounded-2xl mb-6 shadow-glow-purple animate-glow-pulse">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Data Collection</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our AI ingests thousands of data points including team stats, player forms, historical patterns, and market movements in real-time.
                </p>
              </div>

              <div className="text-center p-8 glass-effect-strong rounded-2xl border border-accent-cyan/20 hover:border-accent-cyan/40 transition-all duration-300 card-hover">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-cyan to-accent-blue rounded-2xl mb-6 shadow-glow-cyan animate-glow-pulse delay-300">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">AI Analysis</h3>
                <p className="text-gray-300 leading-relaxed">
                  Machine learning algorithms analyze patterns and calculate probability distributions, identifying value opportunities with statistical confidence scores.
                </p>
              </div>

              <div className="text-center p-8 glass-effect-strong rounded-2xl border border-accent-green/20 hover:border-accent-green/40 transition-all duration-300 card-hover">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-green to-accent-cyan rounded-2xl mb-6 shadow-glow-green animate-glow-pulse delay-500">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Research Delivery</h3>
                <p className="text-gray-300 leading-relaxed">
                  Transparent insights with confidence scores, risk assessments, and detailed explanations delivered for educational research purposes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Free Pick Section */}
        <section id="free-picks" className="py-24">
          <FreePick />
        </section>

        <DisclaimerBanner />

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center premium-border p-12 glass-effect-strong">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                  Ready for <span className="text-gradient-premium">Professional</span> Analytics?
                </h2>
                <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                  Join researchers leveraging institutional-grade quantitative models for market analysis
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  <div className="flex flex-col items-center gap-3 p-6 glass-effect rounded-xl border border-accent-green/20">
                    <CheckCircle className="w-8 h-8 text-accent-green" />
                    <span className="text-lg font-bold text-accent-green">5+ Models</span>
                    <span className="text-gray-300 font-medium text-center">Daily Research</span>
                  </div>
                  <div className="flex flex-col items-center gap-3 p-6 glass-effect rounded-xl border border-accent-cyan/20">
                    <Shield className="w-8 h-8 text-accent-cyan" />
                    <span className="text-lg font-bold text-accent-cyan">Advanced</span>
                    <span className="text-gray-300 font-medium text-center">Risk Analytics</span>
                  </div>
                  <div className="flex flex-col items-center gap-3 p-6 glass-effect rounded-xl border border-accent-purple/20">
                    <Zap className="w-8 h-8 text-accent-purple" />
                    <span className="text-lg font-bold text-accent-purple">Real-time</span>
                    <span className="text-gray-300 font-medium text-center">Market Data</span>
                  </div>
                  <div className="flex flex-col items-center gap-3 p-6 glass-effect rounded-xl border border-accent-pink/20">
                    <Crown className="w-8 h-8 text-accent-pink" />
                    <span className="text-lg font-bold text-accent-pink">Priority</span>
                    <span className="text-gray-300 font-medium text-center">Research Access</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <a
                    href="#free-picks"
                    className="btn-premium px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-premium hover:shadow-glow-purple flex items-center gap-3 min-w-[250px] justify-center"
                  >
                    <Star className="w-6 h-6" />
                    Start with Free Research
                  </a>
                  <div className="text-gray-400 text-sm">
                    No commitment • Educational research only
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)} 
      />

      <Footer />
    </div>
  );
}