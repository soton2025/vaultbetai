'use client';

import Link from 'next/link';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/50 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main disclaimer */}
        <div className="bg-gradient-to-r from-accent-orange/10 to-accent-pink/10 border border-accent-orange/20 rounded-xl p-8 mb-12">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="w-8 h-8 text-accent-orange flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Responsible Gaming Notice</h3>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  <strong>This platform provides AI-generated sports analysis for educational and entertainment purposes only.</strong> 
                  All content is algorithmic analysis based on historical data and statistical models - not professional betting advice, 
                  financial guidance, or guaranteed predictions.
                </p>
                <p>
                  Sports betting involves substantial risk. Past performance does not predict future results. 
                  Only gamble with money you can afford to lose. Gambling can be addictive.
                </p>
                <p className="text-accent-orange font-semibold">
                  If you or someone you know has a gambling problem, seek help immediately.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <a 
              href="https://www.ncpgambling.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-accent-cyan hover:text-accent-green transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              National Problem Gambling Helpline
            </a>
            <a 
              href="https://www.gamblingtherapy.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-accent-cyan hover:text-accent-green transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Gambling Therapy
            </a>
            <a 
              href="https://www.begambleaware.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-accent-cyan hover:text-accent-green transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              BeGambleAware
            </a>
          </div>
        </div>

        {/* Footer links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <div className="space-y-2 text-sm">
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors block">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors block">
                Privacy Policy
              </Link>
              <span className="text-gray-400 block">Age Requirement: 18+</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Disclaimer</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Educational content only</p>
              <p>Not financial advice</p>
              <p>AI-generated analysis</p>
              <p>Gamble responsibly</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <div className="space-y-2 text-sm">
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors block">
                Contact Support
              </Link>
              <Link href="/account" className="text-gray-400 hover:text-white transition-colors block">
                Account Settings
              </Link>
              <a href="mailto:support@aibettingtips.com" className="text-gray-400 hover:text-white transition-colors block">
                support@aibettingtips.com
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>AI Betting Tips</p>
              <p>Educational Platform</p>
              <p>© 2024 All rights reserved</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            This website uses AI technology to analyze sports data for educational purposes. 
            All analysis is algorithmic and not guaranteed. Please gamble responsibly and within your means.
          </p>
        </div>
      </div>
    </footer>
  );
}