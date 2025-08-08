'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'cyan' | 'green' | 'pink' | 'white';
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'purple',
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    purple: 'border-accent-purple/20 border-t-accent-purple',
    cyan: 'border-accent-cyan/20 border-t-accent-cyan', 
    green: 'border-accent-green/20 border-t-accent-green',
    pink: 'border-accent-pink/20 border-t-accent-pink',
    white: 'border-white/20 border-t-white'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div 
          className={`animate-spin rounded-full border-4 ${sizeClasses[size]} ${colorClasses[color]}`}
        />
        <div 
          className={`animate-ping absolute inset-0 rounded-full border-2 ${colorClasses[color].replace('border-t-', 'border-').replace('/20', '/30')} opacity-20`}
        />
      </div>
      {text && (
        <div className={`text-white font-medium ${textSizes[size]} animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );
}