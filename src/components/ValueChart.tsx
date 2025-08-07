'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface ValueChartProps {
  valueRating: number;
  impliedProbability: number;
  modelProbability: number;
  title?: string;
}

export default function ValueChart({ 
  valueRating, 
  impliedProbability, 
  modelProbability, 
  title = "Value Analysis" 
}: ValueChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedImplied, setAnimatedImplied] = useState(0);
  const [animatedModel, setAnimatedModel] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(valueRating);
      setAnimatedImplied(impliedProbability);
      setAnimatedModel(modelProbability);
    }, 300);

    return () => clearTimeout(timer);
  }, [valueRating, impliedProbability, modelProbability]);

  const getValueColor = (rating: number) => {
    if (rating >= 8) return 'text-accent-green';
    if (rating >= 6) return 'text-accent-cyan';
    if (rating >= 4) return 'text-yellow-400';
    return 'text-accent-pink';
  };

  const getValueBgColor = (rating: number) => {
    if (rating >= 8) return 'from-accent-green/20 to-accent-green/5';
    if (rating >= 6) return 'from-accent-cyan/20 to-accent-cyan/5';
    if (rating >= 4) return 'from-yellow-400/20 to-yellow-400/5';
    return 'from-accent-pink/20 to-accent-pink/5';
  };

  const edge = modelProbability - impliedProbability;

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-accent-purple" />
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>

      {/* Value Rating Circle */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-24 h-24 mb-3">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={valueRating >= 8 ? '#10b981' : valueRating >= 6 ? '#06b6d4' : valueRating >= 4 ? '#fbbf24' : '#ec4899'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - animatedValue / 10)}`}
              className="transition-all duration-2000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-2xl font-bold ${getValueColor(valueRating)}`}>
              {animatedValue.toFixed(1)}
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-300 mb-1">Value Rating</div>
          <div className="text-xs text-gray-400">Scale: 1-10</div>
        </div>
      </div>

      {/* Probability Comparison */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Market Probability</span>
            <span className="text-sm font-bold text-gray-200">{animatedImplied.toFixed(1)}%</span>
          </div>
          <div className="bg-dark-300/50 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-gray-500 to-gray-400 transition-all duration-1500 ease-out"
              style={{ width: `${animatedImplied}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Model Probability</span>
            <span className="text-sm font-bold text-accent-cyan">{animatedModel.toFixed(1)}%</span>
          </div>
          <div className="bg-dark-300/50 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue transition-all duration-1500 ease-out"
              style={{ width: `${animatedModel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Edge Analysis */}
      <div className={`mt-6 p-4 rounded-xl bg-gradient-to-br ${getValueBgColor(valueRating)} border border-gray-600/30`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${getValueColor(valueRating)}`} />
            <span className="text-sm font-semibold text-gray-300">Statistical Edge</span>
          </div>
          <div className={`text-lg font-bold ${getValueColor(valueRating)}`}>
            {edge > 0 ? '+' : ''}{edge.toFixed(1)}%
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {edge > 5 ? 'Strong positive edge detected' : 
           edge > 0 ? 'Mild positive edge identified' : 
           edge > -3 ? 'Neutral market pricing' : 
           'Market overvaluation detected'}
        </div>
      </div>
    </div>
  );
}