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
    isPremium: true,
    analysis: {
      headToHead: {
        totalMeetings: 58,
        homeWins: 22,
        awayWins: 20,
        draws: 16,
        lastMeeting: {
          date: '2024-01-31',
          score: '4-1',
          result: 'Liverpool win'
        }
      },
      teamStats: {
        home: {
          recentForm: ['W', 'W', 'D', 'W', 'L'],
          goalsScored: [3, 2, 1, 4, 0],
          goalsConceded: [1, 2, 1, 2, 3],
          homeRecord: { wins: 8, draws: 2, losses: 1 }
        },
        away: {
          recentForm: ['W', 'W', 'W', 'D', 'W'],
          goalsScored: [2, 3, 1, 2, 2],
          goalsConceded: [1, 1, 0, 2, 1],
          awayRecord: { wins: 7, draws: 3, losses: 2 }
        }
      },
      keyPlayers: {
        home: [
          { name: 'Mohamed Salah', position: 'RW', status: 'available', importance: 'key' },
          { name: 'Virgil van Dijk', position: 'CB', status: 'available', importance: 'key' },
          { name: 'Darwin Núñez', position: 'ST', status: 'doubtful', importance: 'important' }
        ],
        away: [
          { name: 'Cole Palmer', position: 'AM', status: 'available', importance: 'key' },
          { name: 'Nicolas Jackson', position: 'ST', status: 'available', importance: 'key' },
          { name: 'Reece James', position: 'RB', status: 'injured', importance: 'important' }
        ]
      },
      venue: {
        name: 'Anfield',
        capacity: 53394,
        homeAdvantage: 78
      },
      weather: {
        conditions: 'Clear skies',
        temperature: 8,
        impact: 'neutral'
      },
      marketTrends: {
        openingOdds: 1.95,
        currentOdds: 1.85,
        movement: 'backing',
        volume: 'high'
      },
      riskFactors: [
        'Liverpool\'s defensive frailties at set pieces',
        'Chelsea\'s inconsistent away form against top 6',
        'Potential rotation due to fixture congestion',
        'Weather conditions may favor defensive play'
      ],
      valueAnalysis: {
        impliedProbability: 54.1,
        modelProbability: 61.3,
        valueRating: 8
      }
    }
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
    isPremium: true,
    analysis: {
      headToHead: {
        totalMeetings: 253,
        homeWins: 97,
        awayWins: 103,
        draws: 53,
        lastMeeting: {
          date: '2024-10-26',
          score: '2-1',
          result: 'Barcelona win'
        }
      },
      teamStats: {
        home: {
          recentForm: ['W', 'W', 'W', 'D', 'W'],
          goalsScored: [3, 2, 4, 1, 2],
          goalsConceded: [0, 1, 1, 1, 0],
          homeRecord: { wins: 9, draws: 2, losses: 0 }
        },
        away: {
          recentForm: ['W', 'L', 'W', 'W', 'D'],
          goalsScored: [2, 0, 3, 2, 1],
          goalsConceded: [1, 4, 1, 0, 1],
          awayRecord: { wins: 6, draws: 3, losses: 3 }
        }
      },
      keyPlayers: {
        home: [
          { name: 'Robert Lewandowski', position: 'ST', status: 'available', importance: 'key' },
          { name: 'Pedri', position: 'CM', status: 'available', importance: 'key' },
          { name: 'Gavi', position: 'CM', status: 'available', importance: 'important' }
        ],
        away: [
          { name: 'Kylian Mbappé', position: 'LW', status: 'available', importance: 'key' },
          { name: 'Vinícius Jr.', position: 'LW', status: 'doubtful', importance: 'key' },
          { name: 'Jude Bellingham', position: 'CM', status: 'injured', importance: 'key' }
        ]
      },
      venue: {
        name: 'Camp Nou',
        capacity: 99354,
        homeAdvantage: 82
      },
      weather: {
        conditions: 'Partly cloudy',
        temperature: 16,
        impact: 'positive'
      },
      marketTrends: {
        openingOdds: 2.10,
        currentOdds: 1.95,
        movement: 'backing',
        volume: 'high'
      },
      riskFactors: [
        'El Clasico unpredictability factor',
        'Real Madrid\'s big game experience',
        'Potential referee pressure in high-profile match',
        'Barcelona\'s European fixture fatigue'
      ],
      valueAnalysis: {
        impliedProbability: 51.3,
        modelProbability: 58.7,
        valueRating: 7
      }
    }
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