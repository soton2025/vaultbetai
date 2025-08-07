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
        bet_type: 'over_1_5_goals',
        recommended_odds: 1.75,
        confidence_score: 89,
        explanation: 'Crystal Palace\'s first-ever Community Shield appearance brings attacking ambition against Premier League champions Liverpool. Liverpool scored in all pre-season fixtures, while Palace will attack at Wembley seeking historic glory. Statistical models show strong edge in this market.',
        is_premium: false,
        published_at: new Date().toISOString(),
        match_date: '2025-08-10T15:00:00Z',
        home_team: 'Crystal Palace',
        away_team: 'Liverpool',
        league: 'FA Community Shield',
        analysis: null // Free bet has no detailed analysis
      },
      'premium-1': {
        id: 'premium-1',
        bet_type: 'btts',
        recommended_odds: 1.90,
        confidence_score: 85,
        explanation: 'Aston Villa\'s attacking pre-season form meets Villarreal\'s possession-based approach. Villa scored 12 goals in 4 friendlies, while Villarreal\'s technical style creates chances. Both teams prioritize attacking football in final preparations.',
        is_premium: true,
        published_at: new Date().toISOString(),
        match_date: '2025-08-10T20:00:00Z',
        home_team: 'Aston Villa',
        away_team: 'Villarreal',
        league: 'Club Friendly',
        analysis: {
          headToHead: {
            totalMeetings: 4,
            homeWins: 2,
            awayWins: 1,
            draws: 1,
            lastMeeting: {
              date: '2022-04-06',
              score: '2-1',
              result: 'Aston Villa win'
            }
          },
          teamStats: {
            home: {
              recentForm: ['W', 'W', 'D', 'W', 'W'],
              goalsScored: [3, 4, 2, 2, 1],
              goalsConceded: [1, 2, 2, 0, 1],
              homeRecord: { wins: 4, draws: 1, losses: 0 }
            },
            away: {
              recentForm: ['W', 'D', 'W', 'L', 'W'],
              goalsScored: [2, 1, 3, 0, 2],
              goalsConceded: [1, 1, 2, 2, 1],
              awayRecord: { wins: 3, draws: 1, losses: 1 }
            }
          },
          keyPlayers: {
            home: [
              { name: 'Ollie Watkins', position: 'ST', status: 'available', importance: 'key' },
              { name: 'John McGinn', position: 'CM', status: 'available', importance: 'key' },
              { name: 'Emiliano Martinez', position: 'GK', status: 'available', importance: 'important' }
            ],
            away: [
              { name: 'Gerard Moreno', position: 'ST', status: 'available', importance: 'key' },
              { name: 'Dani Parejo', position: 'CM', status: 'available', importance: 'key' },
              { name: 'Juan Foyth', position: 'CB', status: 'doubtful', importance: 'important' }
            ]
          },
          venue: {
            name: 'Estadio de la Ceramica',
            capacity: 23500,
            homeAdvantage: 65
          },
          weather: {
            conditions: 'Clear',
            temperature: 28,
            impact: 'positive'
          },
          marketTrends: {
            openingOdds: 1.95,
            currentOdds: 1.90,
            movement: 'slight_backing',
            volume: 'medium'
          },
          riskFactors: [
            'Pre-season friendly with potential rotation',
            'Villa\'s defensive adjustments under new system',
            'Villarreal\'s conservative approach in friendlies',
            'Heat conditions may reduce intensity'
          ],
          valueAnalysis: {
            impliedProbability: 52.6,
            modelProbability: 63.2,
            valueRating: 8.5
          }
        }
      },
      'premium-2': {
        id: 'premium-2',
        bet_type: 'arsenal_handicap_minus_1',
        recommended_odds: 2.10,
        confidence_score: 82,
        explanation: 'Arsenal\'s Emirates home advantage in final pre-season preparation meets Athletic Club\'s physical approach. Arsenal\'s squad depth and home crowd create significant edge for convincing victory in Emirates Cup finale.',
        is_premium: true,
        published_at: new Date().toISOString(),
        match_date: '2025-08-09T17:00:00Z',
        home_team: 'Arsenal',
        away_team: 'Athletic Club',
        league: 'Emirates Cup',
        analysis: {
          headToHead: {
            totalMeetings: 8,
            homeWins: 4,
            awayWins: 2,
            draws: 2,
            lastMeeting: {
              date: '2023-07-22',
              score: '4-1',
              result: 'Arsenal win'
            }
          },
          teamStats: {
            home: {
              recentForm: ['W', 'W', 'W', 'D', 'W'],
              goalsScored: [3, 2, 4, 1, 3],
              goalsConceded: [0, 1, 1, 1, 0],
              homeRecord: { wins: 4, draws: 1, losses: 0 }
            },
            away: {
              recentForm: ['D', 'W', 'L', 'W', 'D'],
              goalsScored: [1, 2, 0, 3, 1],
              goalsConceded: [1, 1, 2, 2, 1],
              awayRecord: { wins: 2, draws: 2, losses: 1 }
            }
          },
          keyPlayers: {
            home: [
              { name: 'Bukayo Saka', position: 'RW', status: 'available', importance: 'key' },
              { name: 'Martin Odegaard', position: 'AM', status: 'available', importance: 'key' },
              { name: 'Gabriel Jesus', position: 'ST', status: 'available', importance: 'important' }
            ],
            away: [
              { name: 'Inaki Williams', position: 'ST', status: 'available', importance: 'key' },
              { name: 'Nico Williams', position: 'LW', status: 'available', importance: 'key' },
              { name: 'Aymeric Laporte', position: 'CB', status: 'doubtful', importance: 'important' }
            ]
          },
          venue: {
            name: 'Emirates Stadium',
            capacity: 60704,
            homeAdvantage: 82
          },
          weather: {
            conditions: 'Light rain',
            temperature: 18,
            impact: 'neutral'
          },
          marketTrends: {
            openingOdds: 2.25,
            currentOdds: 2.10,
            movement: 'backing',
            volume: 'high'
          },
          riskFactors: [
            'Athletic\'s Europa League final experience',
            'Pre-season friendly rotation policy',
            'Weather conditions favoring physical play',
            'Arsenal\'s tendency for slow tournament starts'
          ],
          valueAnalysis: {
            impliedProbability: 47.6,
            modelProbability: 58.4,
            valueRating: 8.2
          }
        }
      },
      'premium-3': {
        id: 'premium-3',
        bet_type: 'under_2_5_goals',
        recommended_odds: 1.95,
        confidence_score: 78,
        explanation: 'Bournemouth\'s defensive pre-season focus meets Real Sociedad\'s controlled possession style. Both teams prioritize tactical preparation over high-scoring encounters in final friendly preparations.',
        is_premium: true,
        published_at: new Date().toISOString(),
        match_date: '2025-08-09T17:15:00Z',
        home_team: 'Bournemouth',
        away_team: 'Real Sociedad',
        league: 'Club Friendly',
        analysis: {
          headToHead: {
            totalMeetings: 2,
            homeWins: 1,
            awayWins: 1,
            draws: 0,
            lastMeeting: {
              date: '2023-08-05',
              score: '1-2',
              result: 'Real Sociedad win'
            }
          },
          teamStats: {
            home: {
              recentForm: ['D', 'W', 'D', 'L', 'W'],
              goalsScored: [1, 2, 0, 0, 1],
              goalsConceded: [1, 1, 0, 2, 0],
              homeRecord: { wins: 2, draws: 2, losses: 1 }
            },
            away: {
              recentForm: ['W', 'D', 'W', 'D', 'L'],
              goalsScored: [2, 1, 1, 1, 0],
              goalsConceded: [0, 1, 0, 1, 3],
              awayRecord: { wins: 2, draws: 2, losses: 1 }
            }
          },
          keyPlayers: {
            home: [
              { name: 'Dominic Solanke', position: 'ST', status: 'available', importance: 'key' },
              { name: 'Antoine Semenyo', position: 'RW', status: 'available', importance: 'key' },
              { name: 'Neto', position: 'GK', status: 'available', importance: 'important' }
            ],
            away: [
              { name: 'Mikel Oyarzabal', position: 'LW', status: 'available', importance: 'key' },
              { name: 'Martin Zubimendi', position: 'DM', status: 'available', importance: 'key' },
              { name: 'Takefusa Kubo', position: 'RW', status: 'doubtful', importance: 'important' }
            ]
          },
          venue: {
            name: 'Vitality Stadium',
            capacity: 11364,
            homeAdvantage: 68
          },
          weather: {
            conditions: 'Overcast',
            temperature: 16,
            impact: 'neutral'
          },
          marketTrends: {
            openingOdds: 2.05,
            currentOdds: 1.95,
            movement: 'backing',
            volume: 'medium'
          },
          riskFactors: [
            'Bournemouth\'s inconsistent pre-season scoring',
            'Real Sociedad\'s away friendly approach',
            'Small stadium atmosphere impact',
            'Late substitutions could change game flow'
          ],
          valueAnalysis: {
            impliedProbability: 51.3,
            modelProbability: 62.1,
            valueRating: 7.8
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