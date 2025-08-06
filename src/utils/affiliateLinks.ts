import { AffiliateLink } from '@/types';

const affiliateLinks: AffiliateLink[] = [
  {
    bookmaker: 'Bet365',
    url: 'https://www.bet365.com/?affiliate=your-bet365-affiliate-id',
    regions: ['UK', 'EU', 'AU', 'CA']
  },
  {
    bookmaker: 'DraftKings',
    url: 'https://sportsbook.draftkings.com/?wpcid=your-draftkings-affiliate-id',
    regions: ['US']
  },
  {
    bookmaker: 'FanDuel',
    url: 'https://sportsbook.fanduel.com/?wpcid=your-fanduel-affiliate-id',
    regions: ['US']
  },
  {
    bookmaker: 'Betway',
    url: 'https://betway.com/?btag=your-betway-affiliate-id',
    regions: ['UK', 'EU', 'CA', 'ZA']
  },
  {
    bookmaker: 'Unibet',
    url: 'https://www.unibet.com/?affiliateId=your-unibet-affiliate-id',
    regions: ['EU', 'AU']
  }
];

export function getAffiliateLink(userLocation?: string): string {
  if (!userLocation) {
    return affiliateLinks[0].url;
  }

  const locationToRegion: { [key: string]: string } = {
    'US': 'US',
    'USA': 'US',
    'United States': 'US',
    'UK': 'UK',
    'United Kingdom': 'UK',
    'Canada': 'CA',
    'Australia': 'AU',
    'South Africa': 'ZA',
    'Germany': 'EU',
    'France': 'EU',
    'Spain': 'EU',
    'Italy': 'EU',
    'Netherlands': 'EU'
  };

  const region = locationToRegion[userLocation] || 'UK';
  
  const availableLinks = affiliateLinks.filter(link => 
    link.regions.includes(region)
  );

  return availableLinks.length > 0 ? availableLinks[0].url : affiliateLinks[0].url;
}

export async function getUserLocation(): Promise<string | undefined> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_name;
  } catch (error) {
    console.error('Failed to get user location:', error);
    return undefined;
  }
}