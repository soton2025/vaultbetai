// Find more UK and European league IDs that have matches
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function findMoreLeagues() {
  const apiKey = process.env.THESPORTSDB_API_KEY || 'test';
  
  // Try various league IDs - these are commonly known IDs from TheSportsDB
  const leaguesToTest = {
    // UK & Ireland
    'Scottish Premiership': '4330',
    'Scottish Championship': '4508', 
    'Scottish League One': '4509',
    'Scottish League Two': '4510',
    'FA Cup': '4371',
    'League Cup': '4369',
    'National League': '4750',
    'League of Ireland': '4351',
    
    // Major European leagues  
    'La Liga': '4335',
    'Bundesliga': '4331',
    'Serie A': '4332',
    'Ligue 1': '4334',
    'Eredivisie': '4337',
    'Belgian Pro League': '4351',
    'Portuguese Liga': '4344',
    
    // Other popular leagues
    'MLS': '4346',
    'Liga MX': '4347',
    'Brazilian Serie A': '4351',
    'Argentine Primera': '4378'
  };

  console.log('🔍 Searching for leagues with upcoming matches...');
  console.log('📅 Looking for matches in next 7 days');
  
  const leaguesWithMatches = [];
  
  for (const [leagueName, leagueId] of Object.entries(leaguesToTest)) {
    try {
      const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnextleague.php?id=${leagueId}`;
      console.log(`\n🌐 Testing: ${leagueName} (${leagueId})`);
      
      const response = await axios.get(url);
      const events = response.data?.events || [];
      
      if (events.length > 0) {
        // Filter for matches in next 7 days
        const upcomingMatches = events.filter(event => {
          const matchDate = new Date(`${event.dateEvent} ${event.strTime}`);
          const now = new Date();
          const hoursFromNow = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          return hoursFromNow > 0 && hoursFromNow <= (7 * 24);
        });
        
        console.log(`📊 ${events.length} total events, ${upcomingMatches.length} within 7 days`);
        
        if (upcomingMatches.length > 0) {
          leaguesWithMatches.push({
            name: leagueName,
            id: leagueId,
            matchCount: upcomingMatches.length
          });
          
          console.log('✅ MATCHES FOUND! Sample matches:');
          upcomingMatches.slice(0, 3).forEach(event => {
            const matchDate = new Date(`${event.dateEvent} ${event.strTime}`);
            console.log(`  - ${event.strHomeTeam} vs ${event.strAwayTeam} on ${matchDate.toLocaleDateString()}`);
          });
        } else {
          console.log('❌ No matches in next 7 days');
        }
      } else {
        console.log('❌ No events found');
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.error(`❌ Error testing ${leagueName}: ${error.message}`);
    }
  }
  
  console.log('\n🎯 SUMMARY - Leagues with upcoming matches:');
  if (leaguesWithMatches.length === 0) {
    console.log('❌ No leagues found with matches in next 7 days');
  } else {
    leaguesWithMatches.forEach(league => {
      console.log(`✅ ${league.name} (${league.id}): ${league.matchCount} matches`);
    });
    
    console.log('\n📝 Add these to your sportsApi.ts LEAGUES config:');
    leaguesWithMatches.forEach(league => {
      const key = league.name.toUpperCase().replace(/\s/g, '_').replace(/[^A-Z_]/g, '');
      console.log(`${key}: '${league.id}',`);
    });
  }
}

findMoreLeagues();