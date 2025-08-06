import axios from 'axios';
import { DatabaseService } from './database';

// Sports API Integration Service
export class SportsApiService {
  private static theSportsDbBaseUrl = 'https://www.thesportsdb.com/api/v1/json';
  private static oddsApiBaseUrl = 'https://api.the-odds-api.com/v4';
  
  // Rate limiting tracking
  private static apiCalls: { [key: string]: number[] } = {};
  
  // Rate limit checker
  private static async checkRateLimit(apiProvider: string, maxCalls: number, windowMs: number) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.apiCalls[apiProvider]) {
      this.apiCalls[apiProvider] = [];
    }
    
    // Remove old calls outside the window
    this.apiCalls[apiProvider] = this.apiCalls[apiProvider].filter(time => time > windowStart);
    
    if (this.apiCalls[apiProvider].length >= maxCalls) {
      throw new Error(`Rate limit exceeded for ${apiProvider}`);
    }
    
    this.apiCalls[apiProvider].push(now);
  }

  // Fetch upcoming matches from TheSportsDB
  static async getUpcomingMatches(leagueId?: string, days: number = 7) {
    try {
      await this.checkRateLimit('thesportsdb', 100, 60 * 60 * 1000); // 100 calls per hour
      
      const apiKey = process.env.THESPORTSDB_API_KEY || 'test';
      let url = `${this.theSportsDbBaseUrl}/${apiKey}/eventsnextleague.php`;
      
      if (leagueId) {
        url += `?id=${leagueId}`;
      } else {
        // Premier League as default
        url += '?id=4328';
      }

      console.log(`🌐 API URL: ${url}`);
      const response = await axios.get(url);
      await DatabaseService.logApiUsage('thesportsdb', 'eventsnextleague', 0);
      
      console.log(`📡 API Response status: ${response.status}`);
      console.log(`📊 API Response events count: ${response.data?.events?.length || 0}`);
      
      if (response.data?.events) {
        const transformedMatches = this.transformTheSportsDbMatches(response.data.events, days);
        console.log(`🔄 Transformed to ${transformedMatches.length} matches after filtering`);
        return transformedMatches;
      }
      
      console.log('⚠️ No events found in API response');
      return [];
    } catch (error) {
      console.error('Error fetching matches from TheSportsDB:', error);
      throw error;
    }
  }

  // Transform TheSportsDB match data to our format
  private static transformTheSportsDbMatches(events: any[], days: number) {
    const now = new Date();
    const futureLimit = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return events
      .filter(event => {
        const matchDate = new Date(`${event.dateEvent} ${event.strTime}`);
        return matchDate > now && matchDate <= futureLimit;
      })
      .map(event => ({
        apiId: event.idEvent,
        homeTeam: event.strHomeTeam,
        awayTeam: event.strAwayTeam,
        matchDate: new Date(`${event.dateEvent} ${event.strTime}`),
        league: event.strLeague,
        venue: event.strVenue,
        season: event.strSeason
      }));
  }

  // Fetch betting odds from The Odds API
  static async getBettingOdds(sport: string = 'soccer_epl', region: string = 'uk') {
    try {
      const apiKey = process.env.ODDS_API_KEY;
      if (!apiKey) {
        throw new Error('Odds API key not configured');
      }

      await this.checkRateLimit('odds-api', 500, 30 * 24 * 60 * 60 * 1000); // 500 calls per month
      
      const url = `${this.oddsApiBaseUrl}/sports/${sport}/odds`;
      const response = await axios.get(url, {
        params: {
          apiKey,
          regions: region,
          markets: 'h2h,spreads,totals', // Head-to-head, spreads, over/under
          oddsFormat: 'decimal',
          dateFormat: 'iso'
        }
      });

      await DatabaseService.logApiUsage('odds-api', 'odds', 0.002); // Estimated cost per call
      
      return this.transformOddsData(response.data);
    } catch (error) {
      console.error('Error fetching betting odds:', error);
      throw error;
    }
  }

  // Transform odds data to our format
  private static transformOddsData(oddsData: any[]) {
    return oddsData.map(match => ({
      apiId: match.id,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      commenceTime: new Date(match.commence_time),
      bookmakers: match.bookmakers?.map((bookmaker: any) => ({
        name: bookmaker.title,
        markets: bookmaker.markets?.map((market: any) => ({
          key: market.key,
          outcomes: market.outcomes?.map((outcome: any) => ({
            name: outcome.name,
            price: outcome.price
          }))
        }))
      }))
    }));
  }

  // Fetch team statistics
  static async getTeamStatistics(teamId: string, season: string = '2024-25') {
    try {
      await this.checkRateLimit('thesportsdb', 100, 60 * 60 * 1000);
      
      const apiKey = process.env.THESPORTSDB_API_KEY || 'test';
      const url = `${this.theSportsDbBaseUrl}/${apiKey}/eventslast.php?id=${teamId}`;
      
      const response = await axios.get(url);
      await DatabaseService.logApiUsage('thesportsdb', 'eventslast', 0);
      
      if (response.data?.results) {
        return this.calculateTeamStats(response.data.results, teamId);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching team statistics:', error);
      return null;
    }
  }

  // Calculate team statistics from recent matches
  private static calculateTeamStats(matches: any[], teamId: string) {
    const stats = {
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      homeWins: 0,
      homeDraws: 0,
      homeLosses: 0,
      awayWins: 0,
      awayDraws: 0,
      awayLosses: 0,
      currentForm: [] as string[],
      recentGoalsScored: [] as number[],
      recentGoalsConceded: [] as number[]
    };

    const recentMatches = matches.slice(0, 10); // Last 10 matches
    const formMatches = matches.slice(0, 5); // Last 5 for form

    recentMatches.forEach(match => {
      const isHome = match.idHomeTeam === teamId;
      const homeScore = parseInt(match.intHomeScore) || 0;
      const awayScore = parseInt(match.intAwayScore) || 0;
      
      stats.matchesPlayed++;
      
      if (isHome) {
        stats.goalsFor += homeScore;
        stats.goalsAgainst += awayScore;
        
        if (homeScore > awayScore) {
          stats.wins++;
          stats.homeWins++;
        } else if (homeScore < awayScore) {
          stats.losses++;
          stats.homeLosses++;
        } else {
          stats.draws++;
          stats.homeDraws++;
        }
      } else {
        stats.goalsFor += awayScore;
        stats.goalsAgainst += homeScore;
        
        if (awayScore > homeScore) {
          stats.wins++;
          stats.awayWins++;
        } else if (awayScore < homeScore) {
          stats.losses++;
          stats.awayLosses++;
        } else {
          stats.draws++;
          stats.awayDraws++;
        }
      }
    });

    // Calculate form and recent goals
    formMatches.forEach(match => {
      const isHome = match.idHomeTeam === teamId;
      const homeScore = parseInt(match.intHomeScore) || 0;
      const awayScore = parseInt(match.intAwayScore) || 0;
      
      if (isHome) {
        stats.recentGoalsScored.push(homeScore);
        stats.recentGoalsConceded.push(awayScore);
        
        if (homeScore > awayScore) stats.currentForm.push('W');
        else if (homeScore < awayScore) stats.currentForm.push('L');
        else stats.currentForm.push('D');
      } else {
        stats.recentGoalsScored.push(awayScore);
        stats.recentGoalsConceded.push(homeScore);
        
        if (awayScore > homeScore) stats.currentForm.push('W');
        else if (awayScore < homeScore) stats.currentForm.push('L');
        else stats.currentForm.push('D');
      }
    });

    return stats;
  }

  // Fetch league standings
  static async getLeagueStandings(leagueId: string, season: string = '2024-25') {
    try {
      await this.checkRateLimit('thesportsdb', 100, 60 * 60 * 1000);
      
      const apiKey = process.env.THESPORTSDB_API_KEY || 'test';
      const url = `${this.theSportsDbBaseUrl}/${apiKey}/lookuptable.php?l=${leagueId}&s=${season}`;
      
      const response = await axios.get(url);
      await DatabaseService.logApiUsage('thesportsdb', 'lookuptable', 0);
      
      return response.data?.table || [];
    } catch (error) {
      console.error('Error fetching league standings:', error);
      return [];
    }
  }

  // Available sports and leagues
  static readonly LEAGUES = {
    PREMIER_LEAGUE: '4328',
    CHAMPIONSHIP: '4329',
    LEAGUE_ONE: '4396',
    LEAGUE_TWO: '4397',
    LA_LIGA: '4335',
    BUNDESLIGA: '4331',
    SERIE_A: '4332',
    LIGUE_1: '4334',
    CHAMPIONS_LEAGUE: '4480'
  };

  static readonly SPORTS_ODDS_API = {
    PREMIER_LEAGUE: 'soccer_epl',
    CHAMPIONSHIP: 'soccer_efl_champ',
    LEAGUE_ONE: 'soccer_england_league1',
    LEAGUE_TWO: 'soccer_england_league2',
    LA_LIGA: 'soccer_spain_la_liga',
    BUNDESLIGA: 'soccer_germany_bundesliga',
    SERIE_A: 'soccer_italy_serie_a',
    LIGUE_1: 'soccer_france_ligue_one',
    CHAMPIONS_LEAGUE: 'soccer_uefa_champs_league'
  };

  // Get API usage statistics
  static async getApiUsageStats() {
    const query = `
      SELECT 
        api_provider,
        endpoint,
        SUM(requests_made) as total_requests,
        SUM(cost_estimate) as total_cost,
        DATE_TRUNC('month', date) as month
      FROM api_usage 
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY api_provider, endpoint, month
      ORDER BY month DESC, total_requests DESC
    `;
    
    return await DatabaseService.query(query);
  }
}

// Weather API service for venue conditions
export class WeatherService {
  private static baseUrl = 'https://api.openweathermap.org/data/2.5';

  static async getWeatherForVenue(city: string, matchDate: Date) {
    try {
      const apiKey = process.env.WEATHER_API_KEY;
      if (!apiKey) {
        return {
          conditions: 'Unknown',
          temperature: 15,
          impact: 'neutral'
        };
      }

      const url = `${this.baseUrl}/forecast`;
      const response = await axios.get(url, {
        params: {
          q: city,
          appid: apiKey,
          units: 'metric',
          cnt: 40 // 5 day forecast
        }
      });

      await DatabaseService.logApiUsage('openweather', 'forecast', 0.0025);

      // Find forecast closest to match time
      const matchTime = matchDate.getTime();
      let closestForecast = response.data.list[0];
      let smallestDiff = Math.abs(new Date(closestForecast.dt * 1000).getTime() - matchTime);

      response.data.list.forEach((forecast: any) => {
        const forecastTime = new Date(forecast.dt * 1000).getTime();
        const diff = Math.abs(forecastTime - matchTime);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestForecast = forecast;
        }
      });

      const temperature = Math.round(closestForecast.main.temp);
      const conditions = closestForecast.weather[0].description;
      
      // Determine impact on match
      let impact = 'neutral';
      if (closestForecast.weather[0].main === 'Rain' || closestForecast.wind?.speed > 10) {
        impact = 'negative';
      } else if (temperature > 5 && temperature < 25 && closestForecast.weather[0].main === 'Clear') {
        impact = 'positive';
      }

      return {
        conditions,
        temperature,
        impact
      };

    } catch (error) {
      console.error('Error fetching weather data:', error);
      return {
        conditions: 'Unknown',
        temperature: 15,
        impact: 'neutral'
      };
    }
  }
}