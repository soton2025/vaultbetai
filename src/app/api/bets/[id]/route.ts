import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET /api/bets/[id] - Fetch single betting tip with analysis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock data for specific bet IDs (matching our current frontend)
    const mockBetsWithAnalysis: { [key: string]: any } = {
      '2': {
        id: '2',
        bet_type: 'btts',
        recommended_odds: 1.85,
        confidence_score: 92,
        explanation: 'Liverpool and Chelsea both have leaky defenses but potent attacks. Liverpool has conceded in 7 of their last 8 home games, while Chelsea has scored in every away match this season.',
        is_premium: true,
        published_at: '2024-12-20T17:45:00Z',
        match_date: '2024-12-20T17:45:00Z',
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
      '3': {
        id: '3',
        bet_type: 'home_win',
        recommended_odds: 1.95,
        confidence_score: 78,
        explanation: 'Barcelona has been dominant at Camp Nou with 8 wins in their last 10 home matches. Real Madrid is missing 3 key players due to injury and has struggled in recent away fixtures.',
        is_premium: true,
        published_at: '2024-12-21T20:00:00Z',
        match_date: '2024-12-21T20:00:00Z',
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