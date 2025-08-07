'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Shield, BarChart3 } from 'lucide-react';

interface MetricProps {
  label: string;
  value: number;
  format: 'percentage' | 'decimal' | 'integer';
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: 'green' | 'cyan' | 'purple' | 'pink';
}

const Metric = ({ label, value, format, trend = 'neutral', icon, color }: MetricProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 200);
    return () => clearTimeout(timer);
  }, [value]);

  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'decimal':
        return val.toFixed(2);
      case 'integer':
        return Math.round(val).toString();
      default:
        return val.toString();
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      green: {
        text: 'text-accent-green',
        bg: 'from-accent-green/20 to-accent-green/5',
        border: 'border-accent-green/20',
        icon: 'text-accent-green'
      },
      cyan: {
        text: 'text-accent-cyan',
        bg: 'from-accent-cyan/20 to-accent-cyan/5',
        border: 'border-accent-cyan/20',
        icon: 'text-accent-cyan'
      },
      purple: {
        text: 'text-accent-purple',
        bg: 'from-accent-purple/20 to-accent-purple/5',
        border: 'border-accent-purple/20',
        icon: 'text-accent-purple'
      },
      pink: {
        text: 'text-accent-pink',
        bg: 'from-accent-pink/20 to-accent-pink/5',
        border: 'border-accent-pink/20',
        icon: 'text-accent-pink'
      }
    };
    return colors[color as keyof typeof colors];
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className={`bg-gradient-to-br ${colorClasses.bg} rounded-xl p-4 glass-effect border ${colorClasses.border} card-hover`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-dark-300/50 ${colorClasses.icon}`}>
          {icon}
        </div>
        {trend !== 'neutral' && (
          <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-accent-green' : 'text-accent-pink'}`}>
            <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {trend === 'up' ? '↑' : '↓'}
          </div>
        )}
      </div>
      
      <div className={`text-2xl font-bold ${colorClasses.text} mb-1`}>
        {formatValue(animatedValue)}
      </div>
      
      <div className="text-sm text-gray-300 font-medium">
        {label}
      </div>
    </div>
  );
};

export default function PerformanceMetrics() {
  const metrics = [
    {
      label: 'Model Accuracy',
      value: 87.3,
      format: 'percentage' as const,
      trend: 'up' as const,
      icon: <Target className="w-5 h-5" />,
      color: 'green' as const
    },
    {
      label: 'ROI (7D)',
      value: 12.8,
      format: 'percentage' as const,
      trend: 'up' as const,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'cyan' as const
    },
    {
      label: 'Sharpe Ratio',
      value: 2.34,
      format: 'decimal' as const,
      trend: 'neutral' as const,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'purple' as const
    },
    {
      label: 'Win Rate',
      value: 73.2,
      format: 'percentage' as const,
      trend: 'up' as const,
      icon: <Shield className="w-5 h-5" />,
      color: 'pink' as const
    },
    {
      label: 'Value Bets Found',
      value: 42,
      format: 'integer' as const,
      trend: 'up' as const,
      icon: <Target className="w-5 h-5" />,
      color: 'green' as const
    },
    {
      label: 'Avg Odds',
      value: 2.15,
      format: 'decimal' as const,
      trend: 'neutral' as const,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'cyan' as const
    }
  ];

  return (
    <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 glass-effect-strong border border-gray-700/50">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-accent-purple" />
        <h3 className="text-xl font-bold text-white">Performance Analytics</h3>
        <div className="ml-auto text-xs text-gray-400">Last 30 days</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Metric {...metric} />
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-dark-300/30 rounded-xl border border-gray-600/20">
        <div className="text-sm text-gray-300 mb-2">
          <span className="font-semibold text-accent-cyan">Quantitative Edge:</span> Our algorithmic models consistently identify market inefficiencies through advanced statistical analysis.
        </div>
        <div className="text-xs text-gray-400">
          *Historical performance data for educational analysis. Past results do not guarantee future outcomes.
        </div>
      </div>
    </div>
  );
}