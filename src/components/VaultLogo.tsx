'use client';

import React from 'react';

interface VaultLogoProps {
  className?: string;
  size?: number;
}

export default function VaultLogo({ className = '', size = 48 }: VaultLogoProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="vaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" /> {/* accent-pink */}
            <stop offset="50%" stopColor="#a855f7" /> {/* accent-purple */}
            <stop offset="100%" stopColor="#06b6d4" /> {/* accent-cyan */}
          </linearGradient>
          <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer Shield Shape */}
        <path
          d="M24 4C24 4 16 6 8 10C8 18 8 28 24 44C40 28 40 18 40 10C32 6 24 4 24 4Z"
          fill="url(#vaultGradient)"
          filter="url(#glow)"
          className="animate-glow-pulse"
        />

        {/* Inner Shield Accent */}
        <path
          d="M24 8C24 8 18 9.5 12 12.5C12 18.5 12 26 24 38C36 26 36 18.5 36 12.5C30 9.5 24 8 24 8Z"
          fill="url(#innerGradient)"
          opacity="0.7"
        />

        {/* Vault Door Circle */}
        <circle
          cx="24"
          cy="20"
          r="8"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.9"
        />

        {/* Vault Handle/Lock */}
        <circle
          cx="24"
          cy="20"
          r="3"
          fill="white"
          opacity="0.8"
        />

        {/* Lock Keyhole */}
        <path
          d="M24 18C24.5 18 25 18.5 25 19C25 19.3 24.8 19.6 24.5 19.8L24.8 21.2C24.9 21.4 24.7 21.6 24.5 21.6H23.5C23.3 21.6 23.1 21.4 23.2 21.2L23.5 19.8C23.2 19.6 23 19.3 23 19C23 18.5 23.5 18 24 18Z"
          fill="#1a1a2e"
          opacity="0.8"
        />

        {/* Bottom Security Lines */}
        <line x1="16" y1="30" x2="32" y2="30" stroke="white" strokeWidth="1.5" opacity="0.6" />
        <line x1="18" y1="33" x2="30" y2="33" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <line x1="20" y1="36" x2="28" y2="36" stroke="white" strokeWidth="1.5" opacity="0.3" />
      </svg>

      {/* Animated Glow Ring */}
      <div 
        className="absolute inset-0 rounded-full opacity-30 animate-ping"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)',
          width: size * 1.5,
          height: size * 1.5,
          left: -size * 0.25,
          top: -size * 0.25,
        }}
      />
    </div>
  );
}