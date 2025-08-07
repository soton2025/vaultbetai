// Test TheSportsDB API directly to see what matches we can find
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function testApi() {
  const apiKey = process.env.THESPORTSDB_API_KEY || 'test';
  const leagues = {
    'Premier League': '4328',
    'Championship': '4329', 
    'League One': '4396',
    'League Two': '4397'
  };

  console.log('🔍 Testing TheSportsDB API directly...');
  console.log('📅 Looking for upcoming matches (next 7 days)');
  console.log('🕐 Current time:', new Date().toISOString());
  
  for (const [leagueName, leagueId] of Object.entries(leagues)) {
    try {
      const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnextleague.php?id=${leagueId}`;
      console.log(`\n🌐 Fetching: ${leagueName} (ID: ${leagueId})`);
      console.log(`📡 URL: ${url}`);
      
      const response = await axios.get(url);
      const events = response.data?.events || [];
      
      console.log(`📊 Raw API response: ${events.length} events found`);
      
      if (events.length > 0) {
        console.log('📅 Match dates found:');
        events.slice(0, 5).forEach((event, index) => {
          const matchDate = new Date(`${event.dateEvent} ${event.strTime}`);
          const now = new Date();
          const hoursFromNow = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          const daysFromNow = hoursFromNow / 24;
          
          console.log(`  ${index + 1}. ${event.strHomeTeam} vs ${event.strAwayTeam}`);
          console.log(`     📅 ${matchDate.toISOString()} (${Math.round(daysFromNow)} days, ${Math.round(hoursFromNow)} hours from now)`);
          console.log(`     🏟️ Venue: ${event.strVenue || 'TBD'}`);
        });
        
        // Show how many are within 7 days
        const within7Days = events.filter(event => {
          const matchDate = new Date(`${event.dateEvent} ${event.strTime}`);
          const now = new Date();
          const hoursFromNow = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          return hoursFromNow > 0 && hoursFromNow <= (7 * 24);
        });
        console.log(`✅ ${within7Days.length} matches within next 7 days`);
        
      } else {
        console.log('❌ No events found for this league');
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error fetching ${leagueName}:`, error.message);
    }
  }
}

testApi();