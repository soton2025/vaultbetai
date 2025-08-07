import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET /api/bets/[id] - Fetch single betting tip with analysis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Sample data for specific bet IDs (matching our API response)
    const mockBetsWithAnalysis: { [key: string]: any } = {
      'free-1': {
        id: 'free-1',
        bet_type: 'over_2_5_goals',
        recommended_odds: 2.15,
        confidence_score: 87,
        explanation: 'Advanced statistical modeling indicates both teams have exceptional scoring patterns. Manchester City averages 2.8 goals per game at home this season, while Arsenal has scored in 9 of their last 10 away fixtures. Quantitative models show significant edge in this market.',
        is_premium: false,
        published_at: new Date().toISOString(),
        match_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        home_team: 'Manchester City',
        away_team: 'Arsenal',
        league: 'Premier League',
        analysis: null // Free bet has no detailed analysis
      },
      'premium-1': {
        id: 'premium-1',
        bet_type: 'btts',
        recommended_odds: 1.85,
        confidence_score: 92,
        explanation: 'Institutional-grade algorithmic analysis identifies significant market inefficiency. Advanced defensive metrics combined with offensive efficiency models predict high scoring probability across both teams.',
        is_premium: true,
        published_at: new Date().toISOString(),
        match_date: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        home_team: 'Liverpool',
        away_team: 'Chelsea',
        league: 'Premier League',
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
      'premium-2': {
        id: 'premium-2',
        bet_type: 'home_win',
        recommended_odds: 1.95,
        confidence_score: 78,
        explanation: 'Proprietary quantitative models identify substantial market inefficiency. Barcelona\'s home dominance metrics combined with Real Madrid\'s injury concerns create compelling value backed by advanced statistical analysis.',
        is_premium: true,
        published_at: new Date().toISOString(),
        match_date: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        home_team: 'Barcelona',
        away_team: 'Real Madrid',
        league: 'La Liga',
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
          riskFactors: [
            'El Clasico unpredictability factor',
            'Real Madrid\'s big game experience',
            'Potential referee pressure in high-profile match',
            'Barcelona\'s European fixture fatigue'
          ],
          valueAnalysis: {
            impliedProbability: 51.3,
            modelProbability: 58.7,
            valueRating: 7.8
          }
        }
      },
      'premium-3': {
        id: 'premium-3',
        bet_type: 'under_2_5_goals',
        recommended_odds: 2.05,
        confidence_score: 84,
        explanation: 'Statistical modeling indicates strong defensive patterns. Both teams have evolved into defensively-solid units with low-scoring recent encounters, creating significant value in the under market.',
        is_premium: true,
        published_at: new Date().toISOString(),
        match_date: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
        home_team: 'Atletico Madrid',
        away_team: 'Sevilla',
        league: 'La Liga',
        analysis: {
          headToHead: {
            totalMeetings: 64,
            homeWins: 28,
            awayWins: 18,
            draws: 18,
            lastMeeting: {
              date: '2024-03-17',
              score: '1-0',
              result: 'Atletico win'
            }
          },
          teamStats: {
            home: {
              recentForm: ['W', 'D', 'W', 'D', 'W'],
              goalsScored: [1, 0, 2, 1, 1],
              goalsConceded: [0, 0, 1, 1, 0],
              homeRecord: { wins: 7, draws: 4, losses: 1 }
            },
            away: {
              recentForm: ['D', 'L', 'W', 'D', 'D'],
              goalsScored: [1, 0, 2, 0, 1],
              goalsConceded: [1, 2, 1, 0, 1],
              awayRecord: { wins: 4, draws: 5, losses: 3 }
            }
          },
          keyPlayers: {
            home: [
              { name: 'Jan Oblak', position: 'GK', status: 'available', importance: 'key' },
              { name: 'José María Giménez', position: 'CB', status: 'available', importance: 'key' },
              { name: 'Antoine Griezmann', position: 'CF', status: 'available', importance: 'important' }
            ],
            away: [
              { name: 'Yassine Bono', position: 'GK', status: 'available', importance: 'key' },
              { name: 'Sergio Ramos', position: 'CB', status: 'doubtful', importance: 'key' },
              { name: 'Youssef En-Nesyri', position: 'ST', status: 'available', importance: 'important' }
            ]
          },
          venue: {
            name: 'Wanda Metropolitano',
            capacity: 68456,
            homeAdvantage: 75
          },
          weather: {
            conditions: 'Clear',
            temperature: 12,
            impact: 'neutral'
          },
          riskFactors: [
            'Atletico\'s occasional high-scoring home games',
            'Sevilla\'s inconsistent away attacking form',
            'Potential for late goals in tight matches',
            'Historical low-scoring pattern may change'
          ],
          valueAnalysis: {
            impliedProbability: 48.8,
            modelProbability: 56.2,
            valueRating: 8.4
          }
        }
      }
    };

    const bet = mockBetsWithAnalysis[id];

    if (!bet) {
      return NextResponse.json(
        { success: false, error: 'Betting tip not found' },
        { status: 404 }
      );
    }

    // Transform data to match frontend BetTip interface
    const transformedBet = {
      id: bet.id,
      type: bet.bet_type,
      odds: bet.recommended_odds,
      confidence: bet.confidence_score,
      explanation: bet.explanation,
      match: {
        homeTeam: bet.home_team,
        awayTeam: bet.away_team,
        league: bet.league,
        date: bet.match_date
      },
      affiliateLink: 'https://bet365.com/affiliate-link',
      isPremium: bet.is_premium,
      analysis: bet.analysis
    };

    return NextResponse.json({
      success: true,
      data: transformedBet
    });

  } catch (error) {
    console.error('Error fetching betting tip:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch betting tip',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/bets/[id] - Update betting tip
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Implement database update using DatabaseService
    // For now, return success response
    
    return NextResponse.json({
      success: true,
      data: {
        id,
        ...body,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating betting tip:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update betting tip',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/bets/[id] - Delete betting tip
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Implement database deletion using DatabaseService
    // For now, return success response
    
    return NextResponse.json({
      success: true,
      message: 'Betting tip deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting betting tip:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete betting tip',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}