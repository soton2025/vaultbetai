'use client';

import { useState } from 'react';
import { ExternalLink, Star, Gift, Zap, TrendingUp, Shield } from 'lucide-react';

interface Bookmaker {
  id: string;
  name: string;
  logo: string; // For now using emoji, can be replaced with actual logos
  rating: number;
  welcomeBonus: string;
  features: string[];
  affiliateLink: string;
  regions: string[];
  highlight?: string;
}

const bookmakers: Bookmaker[] = [
  {
    id: 'bet365',
    name: 'Bet365',
    logo: '🎯',
    rating: 4.8,
    welcomeBonus: 'Up to $200 in Bet Credits',
    features: ['Live Streaming', 'Cash Out', 'Best Odds Guaranteed'],
    affiliateLink: 'https://www.bet365.com/affiliate-link-here',
    regions: ['UK', 'EU', 'AU', 'CA'],
    highlight: 'Most Popular'
  },
  {
    id: 'draftkings',
    name: 'DraftKings',
    logo: '👑',
    rating: 4.7,
    welcomeBonus: 'Bet $5, Get $200 in Bonus Bets',
    features: ['Same Game Parlays', 'Daily Fantasy', 'Live Betting'],
    affiliateLink: 'https://www.draftkings.com/affiliate-link-here',
    regions: ['US'],
    highlight: 'Best for US'
  },
  {
    id: 'fanduel',
    name: 'FanDuel',
    logo: '⚡',
    rating: 4.6,
    welcomeBonus: 'Bet $10, Get $200 if Your Bet Wins',
    features: ['Quick Payouts', 'Parlay Insurance', 'Live Chat Support'],
    affiliateLink: 'https://www.fanduel.com/affiliate-link-here',
    regions: ['US']
  },
  {
    id: 'betway',
    name: 'Betway',
    logo: '🚀',
    rating: 4.5,
    welcomeBonus: '100% Match up to $250',
    features: ['Esports Betting', 'Virtual Sports', '24/7 Support'],
    affiliateLink: 'https://www.betway.com/affiliate-link-here',
    regions: ['UK', 'EU', 'CA', 'ZA']
  },
  {
    id: 'unibet',
    name: 'Unibet',
    logo: '🎲',
    rating: 4.4,
    welcomeBonus: 'Risk-Free First Bet up to $500',
    features: ['Betting School', 'Live Casino', 'Mobile App'],
    affiliateLink: 'https://www.unibet.com/affiliate-link-here',
    regions: ['EU', 'AU']
  }
];

interface BookmakerSectionProps {
  userLocation?: string;
}

export default function BookmakerSection({ userLocation }: BookmakerSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Filter bookmakers by user location
  const availableBookmakers = bookmakers.filter(bookmaker => {
    if (!userLocation) return true;
    
    const locationToRegion: { [key: string]: string } = {
      'US': 'US',
      'USA': 'US',
      'United States': 'US',
      'UK': 'UK',
      'United Kingdom': 'UK',
      'Canada': 'CA',
      'Australia': 'AU',
      'South Africa': 'ZA',
      'Germany': 'EU',
      'France': 'EU',
      'Spain': 'EU',
      'Italy': 'EU',
      'Netherlands': 'EU'
    };

    const region = locationToRegion[userLocation] || 'UK';
    return bookmaker.regions.includes(region);
  });

  const handleBookmakerClick = (bookmaker: Bookmaker) => {
    // Track the click for analytics
    console.log(`Affiliate click: ${bookmaker.name}`);
    
    // Open in new tab
    window.open(bookmaker.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-green via-accent-cyan to-accent-blue rounded-2xl flex items-center justify-center shadow-premium animate-glow-pulse">
            <Gift className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Get Started with <span className="text-premium">Trusted</span> Bookmakers
        </h2>
        <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
          Open your betting account with our recommended partners and claim exclusive welcome bonuses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {availableBookmakers.map((bookmaker, index) => (
          <div
            key={bookmaker.id}
            className={`relative bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-8 glass-effect-strong transition-all duration-500 cursor-pointer border border-gray-700/50 hover:border-accent-green/40 hover:scale-105 hover:shadow-premium group ${
              hoveredCard === bookmaker.id ? 'shadow-glow-green' : ''
            }`}
            onMouseEnter={() => setHoveredCard(bookmaker.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleBookmakerClick(bookmaker)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {bookmaker.highlight && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-accent-pink to-accent-purple text-white text-xs font-bold px-4 py-1 rounded-full shadow-premium">
                  {bookmaker.highlight}
                </div>
              </div>
            )}

            <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
              hoveredCard === bookmaker.id ? 'opacity-20' : 'opacity-0'
            } bg-gradient-to-br from-accent-green/20 to-accent-cyan/20`} />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{bookmaker.logo}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{bookmaker.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(bookmaker.rating)
                              ? 'text-accent-orange fill-current'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                      <span className="text-gray-400 text-sm ml-1">({bookmaker.rating})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome Bonus */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-accent-green" />
                  <span className="text-accent-green font-semibold text-sm uppercase tracking-wider">Welcome Bonus</span>
                </div>
                <p className="text-white font-bold text-lg leading-tight">{bookmaker.welcomeBonus}</p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-accent-cyan" />
                  <span className="text-accent-cyan font-semibold text-sm uppercase tracking-wider">Key Features</span>
                </div>
                <div className="space-y-2">
                  {bookmaker.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent-cyan rounded-full" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full btn-premium py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-premium group-hover:shadow-glow-green">
                <span className="flex items-center justify-center gap-3">
                  <TrendingUp className="w-6 h-6" />
                  Open Account
                  <ExternalLink className="w-5 h-5" />
                </span>
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                18+ • Terms & Conditions Apply
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-dark-200 rounded-2xl p-8 glass-effect-strong border border-accent-orange/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-accent-orange" />
            <span className="text-accent-orange font-bold text-lg">Pro Tip</span>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
            Compare odds across multiple bookmakers to maximize your potential returns. 
            Our AI tips work best when you can shop for the best lines!
          </p>
        </div>
      </div>
    </section>
  );
}