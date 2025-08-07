// Test Football-Data.org API for UK football matches
const axios = require('axios');

async function testFootballDataAPI() {
  const apiKey = '8555dd1b161c46b5bda0f0b20b0ee68c';
  const baseUrl = 'https://api.football-data.org/v4';
  
  console.log('🔍 Testing Football-Data.org API...');
  console.log('📅 Looking for upcoming matches');
  console.log('🕐 Current time:', new Date().toISOString());
  
  // Common competition IDs for UK football
  const competitions = {
    'Premier League': 'PL',
    'Championship': 'ELC', 
    'FA Cup': 'FAC',
    'League Cup': 'LC',
    'Scottish Premiership': 'SPL'
  };
  
  try {
    // First, let's see what competitions are available
    console.log('\n🏆 Available competitions:');
    const competitionsResponse = await axios.get(`${baseUrl}/competitions`, {
      headers: { 'X-Auth-Token': apiKey }
    });
    
    const ukCompetitions = competitionsResponse.data.competitions.filter(comp => 
      comp.area.name === 'England' || 
      comp.area.name === 'Scotland' || 
      comp.area.name === 'Wales' ||
      comp.area.name === 'Northern Ireland'
    );
    
    console.log('🇬🇧 UK Competitions found:');
    ukCompetitions.forEach(comp => {
      console.log(`  - ${comp.name} (${comp.code}) - ${comp.area.name}`);
    });
    
    // Now get matches for each UK competition
    console.log('\n🏈 Checking matches for each competition...');
    
    for (const comp of ukCompetitions) {
      try {
        console.log(`\n🔍 Fetching matches for ${comp.name}...`);
        
        const matchesResponse = await axios.get(`${baseUrl}/competitions/${comp.code}/matches`, {
          headers: { 'X-Auth-Token': apiKey },
          params: {
            dateFrom: new Date().toISOString().split('T')[0], // Today
            dateTo: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0] // +7 days
          }
        });
        
        const matches = matchesResponse.data.matches || [];
        console.log(`📊 Found ${matches.length} matches in next 7 days`);
        
        if (matches.length > 0) {
          console.log('✅ Sample matches:');
          matches.slice(0, 5).forEach((match, index) => {
            const matchDate = new Date(match.utcDate);
            const now = new Date();
            const hoursFromNow = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            
            console.log(`  ${index + 1}. ${match.homeTeam.name} vs ${match.awayTeam.name}`);
            console.log(`     📅 ${matchDate.toLocaleDateString()} ${matchDate.toLocaleTimeString()} (${Math.round(hoursFromNow)} hours from now)`);
            console.log(`     🏟️ Status: ${match.status}`);
          });
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        if (error.response?.status === 403) {
          console.log(`❌ ${comp.name}: Access forbidden (might need premium plan)`);
        } else {
          console.log(`❌ ${comp.name}: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testFootballDataAPI();