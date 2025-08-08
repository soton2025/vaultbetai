'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { RiskLevel, BetType } from '@/types';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: FilterState) => void;
  isPremium: boolean;
}

export interface FilterState {
  riskLevel: RiskLevel[];
  betTypes: BetType[];
  minConfidence: number;
  minOdds: number;
  maxOdds: number;
}

const initialFilters: FilterState = {
  riskLevel: [],
  betTypes: [],
  minConfidence: 0,
  minOdds: 1.0,
  maxOdds: 10.0,
};

export default function FilterPanel({ isOpen, onClose, onFiltersChange, isPremium }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  if (!isOpen) return null;

  const handleRiskLevelChange = (risk: RiskLevel) => {
    const newRiskLevels = filters.riskLevel.includes(risk)
      ? filters.riskLevel.filter(r => r !== risk)
      : [...filters.riskLevel, risk];
    
    const newFilters = { ...filters, riskLevel: newRiskLevels };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleBetTypeChange = (type: BetType) => {
    const newBetTypes = filters.betTypes.includes(type)
      ? filters.betTypes.filter(t => t !== type)
      : [...filters.betTypes, type];
    
    const newFilters = { ...filters, betTypes: newBetTypes };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleConfidenceChange = (confidence: number) => {
    const newFilters = { ...filters, minConfidence: confidence };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  if (!isPremium) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fade-in">
        <div className="premium-border max-w-lg w-full glass-effect-strong p-10 animate-scale-in">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-purple to-accent-pink rounded-2xl mb-6 shadow-premium animate-glow-pulse">
              <Filter className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Premium Feature</h3>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">Advanced filters are only available for premium subscribers</p>
            <button
              onClick={onClose}
              className="w-full btn-premium py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-premium"
            >
              <span className="flex items-center justify-center gap-2">
                <Filter className="w-5 h-5" />
                Upgrade to Premium
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="premium-border max-w-3xl w-full glass-effect-strong max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-bold text-white flex items-center gap-3 tracking-tight">
              <Filter className="w-8 h-8 text-accent-cyan animate-glow-pulse" />
              Advanced Filters
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 focus-premium"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6 tracking-tight">Risk Level</h3>
              <div className="grid grid-cols-3 gap-4">
                {(['low', 'medium', 'high'] as RiskLevel[]).map((risk) => (
                  <button
                    key={risk}
                    onClick={() => handleRiskLevelChange(risk)}
                    className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      filters.riskLevel.includes(risk)
                        ? risk === 'low'
                          ? 'bg-accent-green text-white shadow-glow-green border border-accent-green/30'
                          : risk === 'medium'
                          ? 'bg-accent-cyan text-white shadow-glow-cyan border border-accent-cyan/30'
                          : 'bg-accent-pink text-white shadow-glow-pink border border-accent-pink/30'
                        : 'bg-dark-100 text-gray-400 hover:text-white hover:bg-dark-50 glass-effect border border-gray-700/50'
                    }`}
                  >
                    {risk.charAt(0).toUpperCase() + risk.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-white mb-6 tracking-tight">Bet Types</h3>
              <div className="grid grid-cols-2 gap-3">
                {([
                  'over_2_5_goals',
                  'under_2_5_goals',
                  'match_result',
                  'btts',
                  'home_win',
                  'away_win',
                  'draw'
                ] as BetType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleBetTypeChange(type)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      filters.betTypes.includes(type)
                        ? 'bg-accent-purple text-white shadow-glow-purple border border-accent-purple/30'
                        : 'bg-dark-100 text-gray-400 hover:text-white hover:bg-dark-50 glass-effect border border-gray-700/50'
                    }`}
                  >
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-white mb-6 tracking-tight">Minimum Confidence</h3>
              <div className="px-2">
                <div className="relative mb-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minConfidence}
                    onChange={(e) => handleConfidenceChange(parseInt(e.target.value))}
                    className="w-full h-3 bg-dark-300 rounded-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #6366f1 0%, #ec4899 ${filters.minConfidence}%, #374151 ${filters.minConfidence}%, #374151 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-lg text-gray-400">
                  <span>0%</span>
                  <span className="text-accent-cyan font-bold text-xl">{filters.minConfidence}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-6 tracking-tight">Min Odds</h3>
                <input
                  type="number"
                  min="1.0"
                  max="20.0"
                  step="0.1"
                  value={filters.minOdds}
                  onChange={(e) => setFilters({ ...filters, minOdds: parseFloat(e.target.value) })}
                  className="w-full bg-dark-100 text-white rounded-xl px-6 py-4 text-lg focus-premium glass-effect border border-gray-700/50 focus:border-accent-cyan/50 transition-all duration-300"
                />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-6 tracking-tight">Max Odds</h3>
                <input
                  type="number"
                  min="1.0"
                  max="20.0"
                  step="0.1"
                  value={filters.maxOdds}
                  onChange={(e) => setFilters({ ...filters, maxOdds: parseFloat(e.target.value) })}
                  className="w-full bg-dark-100 text-white rounded-xl px-6 py-4 text-lg focus-premium glass-effect border border-gray-700/50 focus:border-accent-cyan/50 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-6 mt-12">
            <button
              onClick={() => {
                setFilters(initialFilters);
                onFiltersChange(initialFilters);
              }}
              className="flex-1 bg-dark-100 text-white py-4 px-8 rounded-xl hover:bg-dark-50 transition-all duration-300 font-semibold text-lg glass-effect border border-gray-700/50 hover:border-gray-600/50"
            >
              Reset Filters
            </button>
            <button
              onClick={onClose}
              className="flex-1 btn-secondary py-4 px-8 rounded-xl font-bold text-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <Filter className="w-5 h-5" />
                Apply Filters
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}