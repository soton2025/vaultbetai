import { BetTip } from '@/types';

export const mockBets: BetTip[] = [
  {
    id: '1',
    type: 'over_2_5_goals',
    odds: 2.15,
    confidence: 87,
    explanation: 'Both teams have strong attacking records with Manchester City averaging 2.8 goals per game at home and Arsenal scoring in 9 of their last 10 away matches. The weather conditions are perfect and both teams are in excellent form.',
    match: {
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      league: 'Premier League',
      date: '2024-12-20 15:30'
    },
    affiliateLink: 'https://bet365.com/affiliate-link',
    isPremium: false
  },
  {
    id: '2',
    type: 'btts',
    odds: 1.85,
    confidence: 92,
    explanation: 'Liverpool and Chelsea both have leaky defenses but potent attacks. Liverpool has conceded in 7 of their last 8 home games, while Chelsea has scored in every away match this season.',
    match: {
      homeTeam: 'Liverpool',
      awayTeam: 'Chelsea',
      league: 'Premier League',
      date: '2024-12-20 17:45'
    },
    affiliateLink: 'https://bet365.com/affiliate-link',
    isPremium: true
  },
  {
    id: '3',
    type: 'home_win',
    odds: 1.95,
    confidence: 78,
    explanation: 'Barcelona has been dominant at Camp Nou with 8 wins in their last 10 home matches. Real Madrid is missing 3 key players due to injury and has struggled in recent away fixtures.',
    match: {
      homeTeam: 'Barcelona',
      awayTeam: 'Real Madrid',
      league: 'La Liga',
      date: '2024-12-21 20:00'
    },
    affiliateLink: 'https://bet365.com/affiliate-link',
    isPremium: true
  },
  {
    id: '4',
    type: 'under_2_5_goals',
    odds: 2.05,
    confidence: 74,
    explanation: 'Both Atletico Madrid and Sevilla play defensive football. Their last 5 encounters have averaged just 1.8 goals per game, and both teams prioritize clean sheets.',
    match: {
      homeTeam: 'Atletico Madrid',
      awayTeam: 'Sevilla',
      league: 'La Liga',
      date: '2024-12-21 18:30'
    },
    affiliateLink: 'https://bet365.com/affiliate-link',
    isPremium: true
  },
  {
    id: '5',
    type: 'match_result',
    odds: 3.25,
    confidence: 69,
    explanation: 'Bayern Munich is unbeaten at home this season and Dortmund has lost 4 of their last 6 away matches in the Bundesliga. Home advantage should be decisive.',
    match: {
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      league: 'Bundesliga',
      date: '2024-12-22 15:30'
    },
    affiliateLink: 'https://bet365.com/affiliate-link',
    isPremium: true
  },
  {
    id: '6',
    type: 'away_win',
    odds: 4.10,
    confidence: 65,
    explanation: 'PSG has excellent away form with 7 wins in 9 away matches. Marseille is dealing with injury issues and has lost their last 2 home games against top opposition.',
    match: {
      homeTeam: 'Marseille',
      awayTeam: 'PSG',
      league: 'Ligue 1',
      date: '2024-12-22 20:45'
    },
    affiliateLink: 'https://bet365.com/affiliate-link',
    isPremium: true
  }
];