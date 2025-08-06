export interface BetTip {
  id: string;
  type: 'over_2_5_goals' | 'match_result' | 'btts' | 'under_2_5_goals' | 'draw' | 'away_win' | 'home_win';
  odds: number;
  confidence: number;
  explanation: string;
  match: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    date: string;
  };
  affiliateLink: string;
  isPremium: boolean;
}

export interface User {
  id: string;
  email: string;
  hasActiveSubscription: boolean;
  freeBetUsedToday: boolean;
  location?: string;
}

export interface AffiliateLink {
  bookmaker: string;
  url: string;
  regions: string[];
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type BetType = BetTip['type'];