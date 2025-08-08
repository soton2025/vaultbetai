export interface TeamStats {
  recentForm: string[]; // ['W', 'L', 'D', 'W', 'W'] - last 5 matches
  goalsScored: number[];
  goalsConceded: number[];
  homeRecord?: {
    wins: number;
    draws: number;
    losses: number;
  };
  awayRecord?: {
    wins: number;
    draws: number;
    losses: number;
  };
}

export interface PlayerInfo {
  name: string;
  position: string;
  status: 'available' | 'injured' | 'suspended' | 'doubtful';
  importance: 'key' | 'important' | 'squad';
}

export interface MatchAnalysis {
  headToHead: {
    totalMeetings: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    lastMeeting: {
      date: string;
      score: string;
      result: string;
    };
  };
  teamStats: {
    home: TeamStats;
    away: TeamStats;
  };
  keyPlayers: {
    home: PlayerInfo[];
    away: PlayerInfo[];
  };
  venue: {
    name: string;
    capacity: number;
    homeAdvantage: number; // percentage
  };
  weather: {
    conditions: string;
    temperature: number;
    impact: 'positive' | 'neutral' | 'negative';
  };
  marketTrends: {
    openingOdds: number;
    currentOdds: number;
    movement: 'backing' | 'drifting' | 'stable';
    volume: 'high' | 'medium' | 'low';
  };
  riskFactors: string[];
  valueAnalysis: {
    impliedProbability: number;
    modelProbability: number;
    valueRating: number; // 1-10 scale
  };
}

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
  analysis?: MatchAnalysis; // Detailed analysis for premium bets
}

export interface User {
  id: string;
  name?: string;
  email: string;
  hasActiveSubscription: boolean;
  freeBetUsedToday: boolean;
  location?: string;
  createdAt?: string;
}

export interface AffiliateLink {
  bookmaker: string;
  url: string;
  regions: string[];
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type BetType = BetTip['type'];