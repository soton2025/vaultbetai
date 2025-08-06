'use client';

import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-gradient-to-r from-accent-orange/20 to-accent-pink/20 border border-accent-orange/30 rounded-xl p-6 mb-8 glass-effect">
      <div className="flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-accent-orange flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-accent-orange font-bold text-lg mb-2">Important Disclaimer</h3>
          <div className="text-gray-300 space-y-2 text-sm leading-relaxed">
            <p>
              <strong>This platform provides AI-generated insights and analysis for educational and entertainment purposes only.</strong> 
              These are NOT professional betting tips or financial advice.
            </p>
            <p>
              All predictions are based on algorithmic analysis of historical data and statistical models. 
              Past performance does not guarantee future results. Gambling involves significant risk and you may lose money.
            </p>
            <p className="text-accent-pink font-semibold">
              Please gamble responsibly. Only bet what you can afford to lose. If you have a gambling problem, seek help immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}